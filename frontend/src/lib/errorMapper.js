/**
 * Error Mapper — normalizes Axios errors into a consistent shape.
 * Components should NEVER parse raw Axios error objects.
 *
 * Every error becomes: { message, code, status }
 */
export const mapError = (error) => {
  // Network error (no response from server)
  if (!error.response) {
    return {
      message: error.message || "Network error. Please check your connection.",
      code: "NETWORK_ERROR",
      status: 0,
    };
  }

  const { status, data } = error.response;

  return {
    message: data?.message || "An unexpected error occurred.",
    code: data?.code || `HTTP_${status}`,
    status,
    errors: data?.errors || [],
  };
};
