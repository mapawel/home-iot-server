class ServiceException extends Error {
  constructor(message: string, options?: { cause: unknown }) {
    super(message, {
      cause: options?.cause,
    });
  }
}

export default ServiceException;
