export const callAPI = async (
  endpoint: string,
  method: string,
  token: string,
  body?: any
) => {
  const res = await fetch(`http://localhost:5000${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  return res.json()
}