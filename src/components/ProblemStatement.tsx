const ProblemStatement = () => {
  return (
    <section className="py-20 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center space-y-8 animate-fade-in">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            🚫 Tired of switching between ChatGPT, Grammarly, and other AI tools?
          </h2>
          
          <div className="space-y-6 text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            <p>
              Every time you copy text, open a new tab, or jump between tools to write, rephrase, check tone, or fix grammar — you lose your flow.
            </p>
            
            <div className="bg-card/30 backdrop-blur-sm border border-primary/20 rounded-2xl p-8 space-y-4">
              <p className="font-semibold text-foreground">Research shows:</p>
              <ul className="space-y-3 text-left">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>The average worker toggles between apps <strong className="text-foreground">1,200+ times a day</strong>.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>It takes up to <strong className="text-foreground">23 minutes to regain focus</strong> after each interruption.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>That's nearly <strong className="text-foreground">5 working weeks lost every year</strong> to context switching.</span>
                </li>
              </ul>
            </div>
            
            <p className="text-xl md:text-2xl font-medium text-foreground pt-4">
              So why juggle multiple tabs when all you want is to stay in your writing zone?
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemStatement;
