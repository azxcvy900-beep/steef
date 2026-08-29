// ============================================================
// SecretManager — reads secrets ONLY from environment variables
// NEVER store secrets in source code.
// ============================================================

export class SecretManager {
  /**
   * Get a required environment variable.
   * Throws if the variable is not set.
   */
  static get(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(
        `[SecretManager] Missing required environment variable: ${key}. ` +
          `Ensure it is set in .env.local (development) or your deployment environment.`
      );
    }
    return value;
  }

  /**
   * Get an optional environment variable.
   * Returns undefined if not set.
   */
  static getOptional(key: string): string | undefined {
    return process.env[key];
  }

  /**
   * Validate that all required secrets are present at startup.
   * Call this during app initialization.
   */
  static validateRequired(keys: string[]): void {
    const missing = keys.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(
        `[SecretManager] Missing required environment variables:\n` +
          missing.map((k) => `  - ${k}`).join('\n') +
          `\n\nSee .env.example for required variables.`
      );
    }
  }

  // ---- Convenience accessors ----

  static getGeminiApiKey(): string {
    return this.get('GEMINI_API_KEY');
  }

  static getFirebaseConfig() {
    return {
      apiKey: this.get('NEXT_PUBLIC_FIREBASE_API_KEY'),
      authDomain: this.get('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
      projectId: this.get('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
      storageBucket: this.get('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: this.get('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
      appId: this.get('NEXT_PUBLIC_FIREBASE_APP_ID'),
    };
  }
}
