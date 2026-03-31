import Antigravity from "../component/Antigravity";

function Home() {
  return (
    <>
      <div className="relative min-h-screen ">
        {/* background */}
        <div className="absolute inset-0 -z-10  bg-black">
          <Antigravity particleShape="box" particleSize={1.8} color="#5ca3ff" />
        </div>
        {/* Content */}
        <div className="relative z-10 text-white">
          <h1>Home Page</h1>
        </div>
      </div>
    </>
  );
}

export default Home;
