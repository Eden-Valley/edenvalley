const GoFundMeWidget = () => {
  return (
    <a
      href="https://www.gofundme.com/f/support-the-lost-geniuses-building-an-adhd-sanctuary-for"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[4.5rem] right-6 z-[100] 
        bg-[#1a1a1a] hover:bg-[#2a2a2a] 
        text-white text-[10px] font-medium
        px-3 py-2 rounded-md 
        border border-white/20
        shadow-lg hover:shadow-xl
        transition-all duration-200
        flex items-center gap-1.5
        w-[160px] justify-center"
    >
      <span className="text-emerald-400">🎗️</span>
      <span>Support our project</span>
    </a>
  );
};

export default GoFundMeWidget;
