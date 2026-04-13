// lib/shurjopay/errors.ts

export class ShurjoPayError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly responseData?: unknown,
  ) {
    super(message);
    this.name = "ShurjoPayError";
  }
}

export class ShurjoPayTokenError extends ShurjoPayError {
  constructor(statusCode?: number, responseData?: unknown) {
    super("Failed to retrieve ShurjoPay token", statusCode, responseData);
    this.name = "ShurjoPayTokenError";
  }
}

export class ShurjoPayPaymentError extends ShurjoPayError {
  constructor(statusCode?: number, responseData?: unknown) {
    super("Failed to create ShurjoPay payment", statusCode, responseData);
    this.name = "ShurjoPayPaymentError";
  }
}

export class ShurjoPayVerificationError extends ShurjoPayError {
  constructor(statusCode?: number, responseData?: unknown) {
    super("Failed to verify ShurjoPay payment", statusCode, responseData);
    this.name = "ShurjoPayVerificationError";
  }
}
