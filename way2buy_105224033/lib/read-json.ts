export async function readJson(request: Request): Promise<
  | { success: true; data: unknown }
  | { success: false }
> {
  try {
    return { success: true, data: await request.json() };
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return { success: false };
    }
    throw error;
  }
}
