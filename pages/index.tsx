import { useState } from "react";

type Endpoint = {
  name: string;
  url: string;
};

const App = () => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([
    {
      name: "customServer",
      url: "https://scalabilitytest.catbytes.io/heavy-process",
    },
    {
      name: "vercel",
      url: "https://next-scalability-demo.vercel.app/api/heavy-process",
    },
    {
      name: "lambda",
      url: "https://m7w2wn4ow6.execute-api.eu-west-2.amazonaws.com/default/HeavyProcessLambda",
    },
  ]);

  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [results, setResults] = useState<{ [key: string]: string }>({});

  const handleAddEndpoint = () => {
    if (!newName || !newUrl) return;
    setEndpoints((prev) => [...prev, { name: newName, url: newUrl }]);
    setNewName("");
    setNewUrl("");
  };

  const handleTest = async (endpoint: Endpoint, concurrency: number) => {
    const requests = [];
    const timings: number[] = [];
    let success = 0;
    let fail = 0;

    for (let i = 0; i < concurrency; i++) {
      const start = performance.now();
      const req = fetch(endpoint.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ test: true }),
      })
        .then((res) => {
          const end = performance.now();
          timings.push(end - start);
          if (res.ok) success++;
          else fail++;
        })
        .catch(() => {
          const end = performance.now();
          timings.push(end - start);
          fail++;
        });
      requests.push(req);
    }

    await Promise.all(requests);

    const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
    const resultText = `🔢 ${concurrency} sent | ✅ ${success} success | ❌ ${fail} failed | ⏱️ Avg: ${avg.toFixed(
      2
    )} ms`;
    setResults((prev) => ({
      ...prev,
      [`${endpoint.name}-${concurrency}`]: resultText,
    }));
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Scalability Tester</h1>

      <div style={{ marginBottom: 24 }}>
        <h2>Add New Endpoint</h2>
        <input
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <input
          placeholder="URL"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          style={{ marginRight: 8, width: 300 }}
        />
        <button onClick={handleAddEndpoint}>Add Endpoint</button>
      </div>

      {endpoints.map((endpoint) => (
        <div key={endpoint.name} style={{ marginBottom: 24 }}>
          <h3>{endpoint.name}</h3>
          {[5, 10, 100].map((count) => (
            <div key={count} style={{ marginBottom: 8 }}>
              <button onClick={() => handleTest(endpoint, count)}>
                Run {count} concurrent requests
              </button>
              <div style={{ marginTop: 4 }}>
                {results[`${endpoint.name}-${count}`]}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default App;
