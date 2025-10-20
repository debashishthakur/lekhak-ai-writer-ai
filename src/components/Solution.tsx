const Solution = () => {
  return (
    <section className="py-20 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-12 animate-fade-in">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              ✨ Meet Lekhak AI — The Seamless AI Writing Assistant, Right Where You Work.
            </h2>
            
            <div className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto space-y-4">
              <p>
                No more switching tabs, copying text, or losing focus.
              </p>
              <p>
                Lekhak AI lives right inside your browser, letting you write, rewrite, rephrase, change tone, check grammar, or even search the web — without ever leaving your window.
              </p>
              <p className="text-2xl font-medium text-foreground pt-2">
                🪄 All your writing tools, one click away.
              </p>
            </div>
          </div>

          {/* Feature Table */}
          <div className="overflow-hidden rounded-2xl border border-primary/20 bg-card/30 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary/10 border-b border-primary/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-lg font-semibold text-foreground">Feature</th>
                    <th className="px-6 py-4 text-left text-lg font-semibold text-foreground">Benefit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
                  <tr className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4 text-foreground font-medium">
                      🧠 Unified AI Workspace
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      Do everything from writing to grammar checks in one tool
                    </td>
                  </tr>
                  <tr className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4 text-foreground font-medium">
                      ⚡ Zero Context Switching
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      Stay focused — no tab hopping
                    </td>
                  </tr>
                  <tr className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4 text-foreground font-medium">
                      🪶 Prompt Refinement Engine
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      Get perfect results without trial & error
                    </td>
                  </tr>
                  <tr className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4 text-foreground font-medium">
                      🔍 Smart Web Assist
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      Search, summarize, and reference the web without leaving your page
                    </td>
                  </tr>
                  <tr className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4 text-foreground font-medium">
                      🔒 Privacy-First Design
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      Use AI help without sharing personal data
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Solution;
