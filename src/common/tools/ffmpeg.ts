import { spawn } from 'node:child_process';

/**
 * FFprobe 格式信息类型
 */
export interface FFprobeFormat {
  filename: string;
  nb_streams: number;
  nb_programs?: number;
  format_name: string;
  format_long_name?: string;
  start_time?: string; // seconds, string
  duration?: string; // seconds, string
  size?: string; // bytes, string
  bit_rate?: string; // bits/s, string
  tags?: Record<string, string>;
}

/**
 * FFprobe 流信息类型（视频/音频/字幕等）
 */
export interface FFprobeStream {
  index: number;
  codec_name?: string;
  codec_long_name?: string;
  profile?: string;
  codec_type: 'video' | 'audio' | 'subtitle' | 'data' | 'attachment' | string;
  codec_tag_string?: string;
  codec_tag?: string;
  width?: number;
  height?: number;
  coded_width?: number;
  coded_height?: number;
  has_b_frames?: number;
  pix_fmt?: string;
  level?: number;
  color_range?: string;
  color_space?: string;
  color_transfer?: string;
  r_frame_rate?: string; // e.g. "30000/1001"
  avg_frame_rate?: string;
  time_base?: string;
  start_pts?: number;
  start_time?: string;
  duration_ts?: number;
  duration?: string;
  bit_rate?: string;
  nb_frames?: string;

  // 音频相关
  sample_fmt?: string;
  sample_rate?: string; // Hz, string
  channels?: number;
  channel_layout?: string;

  // 通用 Tags
  tags?: Record<string, string>;
}

/**
 * FFprobe 原始结果类型
 */
export interface FFprobeResult {
  streams: FFprobeStream[];
  format: FFprobeFormat;
}

/**
 * 规范化后的媒体格式信息
 */
export interface MediaFormatInfo {
  filename: string;
  formatName: string;
  formatLongName?: string;
  duration?: number; // seconds
  size?: number; // bytes
  bitRate?: number; // bits/s
  tags?: Record<string, string>;
}

/**
 * 规范化后的流信息
 */
export interface MediaStreamInfo {
  index: number;
  codecName?: string;
  codecType: 'video' | 'audio' | 'subtitle' | 'data' | 'attachment' | string;
  width?: number;
  height?: number;
  rFrameRate?: string;
  avgFrameRate?: string;
  frameRate?: number; // 解析自 rFrameRate 或 avgFrameRate
  duration?: number; // seconds
  bitRate?: number; // bits/s
  pixFmt?: string;
  profile?: string;
  colorSpace?: string;
  colorRange?: string;

  // 音频
  sampleRate?: number; // Hz
  channels?: number;
  channelLayout?: string;

  tags?: Record<string, string>;
}

/**
 * 统一的媒体信息
 */
export interface MediaInfo {
  format: MediaFormatInfo;
  streams: MediaStreamInfo[];
}

/**
 * 判断是否安装 ffprobe
 */
export async function isFFprobeAvailable(): Promise<boolean> {
  try {
    await runChild('ffprobe', ['-version']);
    return true;
  } catch {
    return false;
  }
}

/**
 * 执行子进程命令并返回 stdout
 */
function runChild(cmd: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => (stdout += chunk.toString()));
    child.stderr.on('data', (chunk) => (stderr += chunk.toString()));
    child.on('error', (err) => reject(err));
    child.on('close', (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(stderr || `Command ${cmd} exited with code ${code}`));
    });
  });
}

/**
 * 使用 ffprobe 获取原始 JSON 信息
 */
export async function ffprobeJson(filePath: string): Promise<FFprobeResult> {
  const args = ['-v', 'error', '-show_format', '-show_streams', '-print_format', 'json', filePath];
  const output = await runChild('ffprobe', args);
  const parsed = JSON.parse(output) as FFprobeResult;
  return parsed;
}

/**
 * 将形如 "30000/1001" 的比率字符串解析为数值
 */
function parseRatio(ratio?: string): number | undefined {
  if (!ratio) return undefined;
  if (ratio.includes('/')) {
    const [a, b] = ratio.split('/').map((v) => Number(v));
    if (b && !Number.isNaN(a) && !Number.isNaN(b)) return a / b;
    return undefined;
  }
  const n = Number(ratio);
  return Number.isNaN(n) ? undefined : n;
}

/**
 * 规范化 FFprobe 结果为类型安全的 MediaInfo
 */
export function normalizeFFprobe(result: FFprobeResult): MediaInfo {
  const format: MediaFormatInfo = {
    filename: result.format.filename,
    formatName: result.format.format_name,
    formatLongName: result.format.format_long_name,
    duration: result.format.duration ? Number(result.format.duration) : undefined,
    size: result.format.size ? Number(result.format.size) : undefined,
    bitRate: result.format.bit_rate ? Number(result.format.bit_rate) : undefined,
    tags: result.format.tags,
  };

  const streams: MediaStreamInfo[] = (result.streams || []).map((s) => ({
    index: s.index,
    codecName: s.codec_name,
    codecType: s.codec_type,
    width: s.width,
    height: s.height,
    rFrameRate: s.r_frame_rate,
    avgFrameRate: s.avg_frame_rate,
    frameRate: parseRatio(s.r_frame_rate) ?? parseRatio(s.avg_frame_rate),
    duration: s.duration ? Number(s.duration) : undefined,
    bitRate: s.bit_rate ? Number(s.bit_rate) : undefined,
    pixFmt: s.pix_fmt,
    profile: s.profile,
    colorSpace: s.color_space,
    colorRange: s.color_range,
    sampleRate: s.sample_rate ? Number(s.sample_rate) : undefined,
    channels: s.channels,
    channelLayout: s.channel_layout,
    tags: s.tags,
  }));

  return { format, streams };
}

/**
 * 获取类型安全的媒体信息（首选方法）
 */
export async function getMediaInfo(filePath: string): Promise<MediaInfo> {
  const raw = await ffprobeJson(filePath);
  return normalizeFFprobe(raw);
}

/**
 * 获取第一条视频流的分辨率与时长
 */
export async function getVideoSummary(
  filePath: string
): Promise<{ width: number; height: number; duration?: number; frameRate?: number } | undefined> {
  const info = await getMediaInfo(filePath);
  const video = info.streams.find((s) => s.codecType === 'video');
  if (!video || !video.width || !video.height) return undefined;
  return {
    width: video.width,
    height: video.height,
    duration: video.duration,
    frameRate: video.frameRate,
  };
}

/**
 * 获取第一条音频流的基础信息
 */
export async function getAudioSummary(
  filePath: string
): Promise<{ sampleRate?: number; channels?: number; bitRate?: number; duration?: number } | undefined> {
  const info = await getMediaInfo(filePath);
  const audio = info.streams.find((s) => s.codecType === 'audio');
  if (!audio) return undefined;
  return {
    sampleRate: audio.sampleRate,
    channels: audio.channels,
    bitRate: audio.bitRate,
    duration: audio.duration,
  };
}
