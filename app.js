import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, Monitor, Laptop, Milk, Trophy, Gift, RefreshCw, MessageSquare, ChevronUp } from 'lucide-react';

const App = () => {
  // Game States
  const [gameState, setGameState] = useState('START'); // START, PLAYING, GAME_OVER
  const [score, setScore] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [isSendingAPI, setIsSendingAPI] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);

  const gameLoopRef = useRef();
  const lastObstacleTime = useRef(0);
  const playerRef = useRef({ y: 0, velocity: 0 });

  // Constants
  const GRAVITY = 0.6;
  const JUMP_FORCE = -12;
  const GROUND_Y = 0;

  const OBSTACLE_TYPES = [
    { id: 'phone', icon: <Smartphone size={24} />, label: 'Điện thoại' },
    { id: 'laptop', icon: <Laptop size={24} />, label: 'Laptop' },
    { id: 'tv', icon: <Monitor size={24} />, label: 'Tivi' }
  ];

  const REWARD_TYPES = [
    { id: 'milo', icon: <Milk size={28} className="text-white" />, points: 15, label: 'Sữa Milo' },
    { id: 'ball', icon: '⚽', points: 25, label: 'Bóng đá' }
  ];

  // Start Game
  const startGame = () => {
    setScore(0);
    setObstacles([]);
    setIsJumping(false);
    setGameState('PLAYING');
    setApiResponse(null);
    playerRef.current = { y: 0, velocity: 0 };
  };

  // Jump Logic
  const handleAction = () => {
    if (gameState === 'START') {
      startGame();
    } else if (gameState === 'PLAYING' && !isJumping) {
      setIsJumping(true);
      playerRef.current.velocity = JUMP_FORCE;
    } else if (gameState === 'GAME_OVER' && !isSendingAPI) {
      startGame();
    }
  };

  // TÍCH HỢP API KHI GAME OVER
  const callMiloCRM_API = async (finalScore) => {
    setIsSendingAPI(true);
    
    // Giả lập Payload gửi đi
    const payload = {
      app_id: "MILO_ENERGY_2026",
      psid: "FB_USER_ID_SAMPLE", // Trong thực tế lấy từ Facebook SDK
      score: finalScore,
      timestamp: new Date().toISOString()
    };

    console.log("🚀 Gọi API CRM Milo với dữ liệu:", payload);

    try {
      // Giả lập độ trễ mạng
      await new Promise(resolve => setTimeout(resolve, 2000));

      let rewardInfo = {};
      if (finalScore < 50) {
        rewardInfo = { 
          status: "TRY_AGAIN", 
          text: "Hãy chơi thêm lần nữa để nạp năng lượng!",
          gift: "Lời chúc"
        };
      } else if (finalScore >= 50 && finalScore <= 100) {
        rewardInfo = { 
          status: "SUCCESS", 
          text: "Chúc mừng bạn nhận được 1 hộp sữa 180ml RTD!",
          gift: "Hộp sữa Milo"
        };
      } else {
        rewardInfo = { 
          status: "SUCCESS", 
          text: "Chúc mừng bạn đã nhận được bình nước năng lượng!",
          gift: "Bình nước Milo"
        };
      }

      setApiResponse(rewardInfo);
    } catch (error) {
      console.error("Lỗi kết nối CRM:", error);
    } finally {
      setIsSendingAPI(false);
    }
  };

  // Game Loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const update = (time) => {
      // Gravity & Jumping
      playerRef.current.velocity += GRAVITY;
      playerRef.current.y += playerRef.current.velocity;

      if (playerRef.current.y >= GROUND_Y) {
        playerRef.current.y = GROUND_Y;
        playerRef.current.velocity = 0;
        setIsJumping(false);
      }

      // Spawn items/obstacles
      if (time - lastObstacleTime.current > 1500) {
        const isReward = Math.random() > 0.5;
        const type = isReward 
          ? REWARD_TYPES[Math.floor(Math.random() * REWARD_TYPES.length)]
          : OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
        
        const newItem = {
          id: Date.now(),
          x: 100,
          type: type,
          isReward: isReward
        };
        setObstacles(prev => [...prev, newItem]);
        lastObstacleTime.current = time;
      }

      // Move & Collision
      setObstacles(prev => {
        const next = prev.map(item => ({ ...item, x: item.x - 1.5 })); // Speed

        next.forEach(item => {
          // Simple Collision Detection
          if (item.x > 10 && item.x < 25 && Math.abs(playerRef.current.y) < 10) {
            if (!item.isReward) {
              setGameState('GAME_OVER');
              callMiloCRM_API(score);
            } else if (!item.collected) {
              item.collected = true;
              setScore(s => s + item.type.points);
            }
          }
        });

        return next.filter(item => item.x > -10 && !item.collected);
      });

      gameLoopRef.current = requestAnimationFrame(update);
    };

    gameLoopRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [gameState, score]);

  // Event listeners
  useEffect(() => {
    const handleKey = (e) => { if (e.code === 'Space') handleAction(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState, isJumping]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#009944] text-white p-4 font-sans select-none overflow-hidden">
      
      {/* Game Header */}
      <div className="w-full max-w-md flex justify-between items-center mb-4 px-2">
        <div className="bg-[#005a2b] px-4 py-2 rounded-xl border-2 border-white/20 flex items-center gap-2 shadow-lg">
          <Trophy className="text-yellow-400" size={20} />
          <span className="font-bold text-2xl">{score}</span>
        </div>
        <div className="text-right">
          <h1 className="font-black italic text-xl leading-tight">VƯỢT MÀN HÌNH</h1>
          <p className="text-[10px] tracking-widest uppercase opacity-70">Săn quà năng lượng</p>
        </div>
      </div>

      {/* Main Stage */}
      <div 
        className="relative w-full max-w-md h-80 bg-gradient-to-b from-green-400 to-green-600 rounded-3xl overflow-hidden border-4 border-white shadow-2xl cursor-pointer"
        onClick={handleAction}
      >
        {/* Background elements */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-8 bg-white rounded-full blur-md"></div>
          <div className="absolute top-24 right-10 w-32 h-10 bg-white rounded-full blur-md"></div>
        </div>

        {/* Ground */}
        <div className="absolute bottom-0 w-full h-12 bg-[#005a2b] border-t-4 border-yellow-400"></div>

        {/* Start Screen */}
        {gameState === 'START' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-green-900/80 backdrop-blur-sm text-center p-6">
            <div className="bg-white p-4 rounded-full mb-4 shadow-xl animate-bounce">
              <Milk size={48} className="text-green-700" />
            </div>
            <h2 className="text-3xl font-black italic mb-2">SẴN SÀNG CHƯA?</h2>
            <p className="text-sm mb-6 text-green-100">Nhấn Space hoặc Chạm để nhảy qua thiết bị điện tử!</p>
            <button className="bg-yellow-400 text-green-900 font-bold px-8 py-3 rounded-full text-xl shadow-lg transform active:scale-95 transition-all">
              BẮT ĐẦU
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-blue-900/95 p-6 text-center animate-in zoom-in duration-300">
            <h3 className="text-xl font-bold italic text-blue-200">KẾT QUẢ</h3>
            <div className="text-6xl font-black text-yellow-400 my-2">{score}</div>
            
            <div className="w-full bg-white/10 rounded-2xl p-4 mb-6 border border-white/20 min-h-[120px] flex flex-col justify-center">
              {isSendingAPI ? (
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="animate-spin text-yellow-400" size={24} />
                  <p className="text-xs">Đang đổi quà qua CRM...</p>
                </div>
              ) : apiResponse ? (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                   <div className="flex justify-center mb-2">
                      <div className="bg-yellow-400 p-2 rounded-full">
                        <Gift className="text-green-800" size={24} />
                      </div>
                   </div>
                   <h4 className="font-bold text-yellow-400 leading-tight">{apiResponse.gift}</h4>
                   <p className="text-xs text-blue-100 mt-1">{apiResponse.text}</p>
                   <div className="flex items-center justify-center gap-1 mt-3 text-[10px] text-green-300">
                      <MessageSquare size={12} /> Kiểm tra Messenger ngay
                   </div>
                </div>
              ) : null}
            </div>

            <button 
              onClick={startGame}
              className="bg-white text-blue-900 font-bold px-6 py-2 rounded-full text-sm shadow-lg flex items-center gap-2"
            >
              <RefreshCw size={16} /> THỬ LẠI
            </button>
          </div>
        )}

        {/* Player Character */}
        <div 
          className="absolute left-16 bottom-12 transition-transform duration-75"
          style={{ transform: translateY(${playerRef.current.y}px) }}
        >
          <div className="relative">
            {/* Athlete Representation */}
            <div className={`w-12 h-16 bg-[#009944] border-2 border-white rounded-lg flex items-center justify-center shadow-lg ${gameState === 'PLAYING' && !isJumping ? 'animate-bounce' : ''}`}>
               <span className="text-[10px] font-black italic">MILO</span>
            </div>
            {/* Shadow */}
            {!isJumping && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/20 rounded-full blur-[2px]"></div>
            )}
          </div>
        </div>

        {/* Obstacles & Rewards */}
        {obstacles.map(item => (
          <div 
            key={item.id}
            className="absolute bottom-12 flex flex-col items-center"
            style={{ left: ${item.x}% }}
          >
            {item.isReward ? (
              <div className="bg-blue-600 p-2 rounded-lg border border-white shadow-lg animate-pulse">
                {item.type.icon}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <div className="bg-red-600 p-2 rounded-md border-2 border-white text-white">
                  {item.type.icon}
                </div>
                <span className="text-[8px] font-bold bg-white text-red-600 px-1 rounded uppercase">DEVICE</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Manual Controls for Mobile */}
      <div className="mt-6 flex flex-col items-center gap-2">
         <button 
          onPointerDown={handleAction}
          className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-xl border-4 border-white active:scale-90 transition-transform"
         >
            <ChevronUp size={40} className="text-green-900" />
         </button>
         <p className="text-xs font-bold opacity-70">CHẠM ĐỂ NHẢY</p>
      </div>

      {/* Footer Info */}
      <div className="mt-auto pt-8 flex flex-col items-center gap-1 opacity-60">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1 text-[10px]"><Milk size={12}/> 50-100đ: Sữa</div>
             <div className="flex items-center gap-1 text-[10px]"><Gift size={12}/> &gt;100đ: Bình nước</div>
          </div>
          <p className="text-[8px]">© 2026 Nestlé Milo - Hệ thống CRM kết nối tự động</p>
      </div>
    </div>
  );
};

export default App;
