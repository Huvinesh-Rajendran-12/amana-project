export default function BackgroundGradients() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Top left violet glow */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-900/20 rounded-full blur-[128px]" 
        aria-hidden="true"
      />
      
      {/* Bottom right blue glow */}
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[128px]" 
        aria-hidden="true"
      />
      
      {/* Center indigo glow */}
      <div 
        className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[128px] opacity-50" 
        aria-hidden="true"
      />
    </div>
  );
}

