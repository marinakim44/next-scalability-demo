import { useState } from "react";

const endpoints = {
  customServer: "http://18.175.171.177:4000/heavy-process",
  vercel: "https://next-scalability-demo.vercel.app/api/heavy-process",
  lambda:
    "https://m7w2wn4ow6.execute-api.eu-west-2.amazonaws.com/default/HeavyProcessLambda",
};

const App = () => {
  const [results, setResults] = useState<{ [key: string]: string }>({});

  const handleTest = async (
    name: keyof typeof endpoints,
    concurrency: number
  ) => {
    const url = endpoints[name];
    const requests = [];
    const timings: number[] = [];
    let success = 0;
    let fail = 0;

    for (let i = 0; i < concurrency; i++) {
      const start = performance.now();
      const req = fetch(url, {
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
    setResults((prev) => ({ ...prev, [`${name}-${concurrency}`]: resultText }));
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Scalability Tester</h1>
      {Object.keys(endpoints).map((name) => (
        <div key={name} style={{ marginBottom: 24 }}>
          <h3>{name}</h3>
          {[5, 10, 100].map((count) => (
            <div key={count} style={{ marginBottom: 8 }}>
              <button
                onClick={() =>
                  handleTest(name as keyof typeof endpoints, count)
                }
              >
                Run {count} concurrent requests
              </button>
              <div style={{ marginTop: 4 }}>{results[`${name}-${count}`]}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default App;
