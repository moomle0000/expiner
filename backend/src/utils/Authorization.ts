function Authorization(cookie: string | undefined): string | undefined {
  if (!cookie || typeof cookie !== 'string') return undefined;
  try {
    const cookieObject: Record<string, string> = cookie.split('; ').reduce((acc, c) => {
      const [key, value] = c.split('=');
      if (key && value) acc[key.trim()] = value.trim();
      return acc;
    }, {} as Record<string, string>);
    return cookieObject['Authorization'];
  } catch {
    return undefined;
  }
}

export { Authorization };
