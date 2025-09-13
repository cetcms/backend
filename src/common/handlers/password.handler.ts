import bcrypt from 'bcrypt';

export function PasswordHandler(plaintext: string) {
  return {
    check: (ciphertext: string) => {
      return bcrypt.compareSync(plaintext, ciphertext);
    },
    hash: () => {
      return bcrypt.hashSync(plaintext, 8);
    },
  };
}
