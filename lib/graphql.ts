export async function fetchGraphQL(query: string, variables = {}) {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
        cache: 'no-store'
    });
    const json = await res.json();
    return json.data;
}
