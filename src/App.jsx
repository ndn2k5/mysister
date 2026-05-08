import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Monitor,
  Laptop,
  Milk,
  Trophy,
  Gift,
  RefreshCw,
  MessageSquare,
  ChevronUp,
} from 'lucide-react';

const OBSTACLE_TYPES = [
  { id: 'phone', icon: <Smartphone size={24} />, label: 'Điện thoại' },
  { id: 'laptop', icon: <Laptop size={24} />, label: 'Laptop' },
  { id: 'tv', icon: <Monitor size={24} />, label: 'Tivi' },
];

const REWARD_TYPES = [
  { id: 'milo', icon: <Milk size={28} className="text-white" />, points: 15, label: 'Sữa Milo' },
  { id: 'ball', icon: '⚽', points: 25, label: 'Bóng đá' },
];

const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const GROUND_Y = 0;

const App = () => {
  const [gameState, setGameState] = useState('START');
  const [score, setScore] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [isSendingAPI, setIsSendingAPI] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);

  const gameLoopRef = useRef(null);
  const lastObstacleTime = useRef(0);
  const playerRef = useRef({ y: 0, velocity: 0 });
  const scoreRef = useRef(0);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const startGame = () => {
    setScore(0);
    scoreRef.current = 0;
    setObstacles([]);
    setIsJumping(false);
    setGameState('PLAYING');
    setApiResponse(null);
    setIsSendingAPI(false);
    playerRef.current = { y: 0, velocity: 0 };
    lastObstacleTime.current = 0;
  };

  const callMiloCRM_API = async (finalScore) => {
    setIsSendingAPI(true);

    const payload = {
      app_id: 'MILO_ENERGY_2026',
      psid: 'FB_USER_ID_SAMPLE',
      score: finalScore,
      timestamp: new Date().toISOString(),
    };

    console.log('Gọi API CRM Milo với dữ liệu:', payload);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      let rewardInfo = {};
      if (finalScore < 50) {
        rewardInfo = {
          status: 'TRY_AGAIN',
          text: 'Hãy chơi thêm lần nữa để nạp năng lượng!',
          gift: 'Lời chúc',
        };
      } else if (finalScore >= 50 && finalScore <= 100) {
        rewardInfo = {
          status: 'SUCCESS',
          text: 'Chúc mừng bạn nhận được 1 hộp sữa 180ml RTD!',
          gift: 'Hộp sữa Milo',
        };
      } else {
        rewardInfo = {
          status: 'SUCCESS',
          text: 'Chúc mừng bạn đã nhận được bình nước năng lượng!',
          gift: 'Bình nước Milo',
        };
      }

      setApiResponse(rewardInfo);
    } catch (error) {
      console.error('Lỗi kết nối CRM:', error);
      setApiResponse({
        status: 'ERROR',
        text: 'Không thể kết nối CRM. Vui lòng thử lại.',
        gift: 'Lỗi kết nối',
      });
    } finally {
      setIsSendingAPI(false);
    }
  };

  const handleAction = () => {
    if (gameState === 'START') {
      startGame();
      return;
    }

    if (gameState === 'PLAYING' && !isJumping) {
      setIsJumping(true);
      playerRef.current.velocity = JUMP_FORCE;
      return;
    }

    if (gameState === 'GAME_OVER' && !isSendingAPI) {
      startGame();
    }
  };

  useEffect(() => {
    if (gameState !== 'PLAYING') return undefined;

    const update = (time) => {
      playerRef.current.velocity += GRAVITY;
      playerRef.current.y += playerRef.current.velocity;

      if (playerRef.current.y >= GROUND_Y) {
        playerRef.current.y = GROUND_Y;
        playerRef.current.velocity = 0;
        setIsJumping(false);
      }

      if (time - lastObstacleTime.current > 1500) {
        const isReward = Math.random() > 0.5;
        const type = isReward
          ? REWARD_TYPES[Math.floor(Math.random() * REWARD_TYPES.length)]
          : OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];

        const newItem = {
          id: `${Date.now()}-${Math.random()}`,
          x: 100,
          type,
          isReward,
        };

        setObstacles((prev) => [...prev, newItem]);
        lastObstacleTime.current = time;
      }

      setObstacles((prev) => {
        const next = prev.map((item) => ({ ...item, x: item.x - 1.5 }));
        let shouldGameOver = false;

        next.forEach((item) => {
          if (item.x > 10 && item.x < 25 && Math.abs(playerRef.current.y) < 10) {
            if (!item.isReward) {
              shouldGameOver = true;
            } else if (!item.collected) {
              item.collected = true;
              setScore((currentScore) => currentScore + item.type.points);
            }
          }
        });

        if (shouldGameOver) {
          setGameState('GAME_OVER');
          callMiloCRM_API(scoreRef.current);
        }

        return next.filter((item) => item.x > -10 && !item.collected);
      });

      gameLoopRef.current = requestAnimationFrame(update);
    };

    gameLoopRef.current = requestAnimationFrame(update);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, isJumping]);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.code === 'Space') {
        event.preventDefault();
        handleAction();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState, isJumping, isSendingAPI]);

  return (
    <div className="flex min-h-screen select-none flex-col items-center justify-center overflow-hidden bg-[#009944] p-4 font-sans text-white">
      <div className="mb-4 flex w-full max-w-md items-center justify-between px-2">
        <div className="flex items-center gap-2 rounded-xl border-2 border-white/20 bg-[#005a2b] px-4 py-2 shadow-lg">
          <Trophy className="text-yellow-400" size={20} />
          <span className="text-2xl font-bold">{score}</span>
        </div>
        <div className="text-right">
          <h1 className="text-xl font-black italic leading-tight">VƯỢT MÀN HÌNH</h1>
          <p className="text-[10px] uppercase tracking-widest opacity-70">Săn quà năng lượng</p>
        </div>
      </div>

      <div
        className="relative h-80 w-full max-w-md cursor-pointer overflow-hidden rounded-3xl border-4 border-white bg-gradient-to-b from-green-400 to-green-600 shadow-2xl"
        onClick={handleAction}
      >
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute left-10 top-10 h-8 w-20 rounded-full bg-white blur-md" />
          <div className="absolute right-10 top-24 h-10 w-32 rounded-full bg-white blur-md" />
        </div>

        <div className="absolute bottom-0 h-12 w-full border-t-4 border-yellow-400 bg-[#005a2b]" />

        {gameState === 'START' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-green-900/80 p-6 text-center backdrop-blur-sm">
            <div className="mb-4 animate-bounce rounded-full bg-white p-4 shadow-xl">
              <Milk size={48} className="text-green-700" />
            </div>
            <h2 className="mb-2 text-3xl font-black italic">SẴN SÀNG CHƯA?</h2>
            <p className="mb-6 text-sm text-green-100">Nhấn Space hoặc chạm để nhảy qua thiết bị điện tử!</p>
            <button className="rounded-full bg-yellow-400 px-8 py-3 text-xl font-bold text-green-900 shadow-lg transition-all active:scale-95">
              BẮT ĐẦU
            </button>
          </div>
        )}

        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-blue-900/95 p-6 text-center">
            <h3 className="text-xl font-bold italic text-blue-200">KẾT QUẢ</h3>
            <div className="my-2 text-6xl font-black text-yellow-400">{score}</div>

            <div className="mb-6 flex min-h-[120px] w-full flex-col justify-center rounded-2xl border border-white/20 bg-white/10 p-4">
              {isSendingAPI ? (
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="animate-spin text-yellow-400" size={24} />
                  <p className="text-xs">Đang đổi quà qua CRM...</p>
                </div>
              ) : apiResponse ? (
                <div>
                  <div className="mb-2 flex justify-center">
                    <div className="rounded-full bg-yellow-400 p-2">
                      <Gift className="text-green-800" size={24} />
                    </div>
                  </div>
                  <h4 className="font-bold leading-tight text-yellow-400">{apiResponse.gift}</h4>
                  <p className="mt-1 text-xs text-blue-100">{apiResponse.text}</p>
                  <div className="mt-3 flex items-center justify-center gap-1 text-[10px] text-green-300">
                    <MessageSquare size={12} /> Kiểm tra Messenger ngay
                  </div>
                </div>
              ) : null}
            </div>

            <button
              onClick={startGame}
              className="flex items-center gap-2 rounded-full bg-white px-6 py-2 text-sm font-bold text-blue-900 shadow-lg"
            >
              <RefreshCw size={16} /> THỬ LẠI
            </button>
          </div>
        )}

        <div
          className="absolute bottom-12 left-16 transition-transform duration-75"
          style={{ transform: `translateY(${playerRef.current.y}px)` }}
        >
          <div className="relative">
            <div
              className={`flex h-16 w-12 items-center justify-center rounded-lg border-2 border-white bg-[#009944] shadow-lg ${
                gameState === 'PLAYING' && !isJumping ? 'animate-bounce' : ''
              }`}
            >
              <span className="text-[10px] font-black italic">MILO</span>
            </div>
            {!isJumping && <div className="absolute -bottom-2 left-1/2 h-2 w-8 -translate-x-1/2 rounded-full bg-black/20 blur-[2px]" />}
          </div>
        </div>

        {obstacles.map((item) => (
          <div
            key={item.id}
            className="absolute bottom-12 flex flex-col items-center"
            style={{ left: `${item.x}%` }}
          >
            {item.isReward ? (
              <div className="animate-pulse rounded-lg border border-white bg-blue-600 p-2 shadow-lg">{item.type.icon}</div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <div className="rounded-md border-2 border-white bg-red-600 p-2 text-white">{item.type.icon}</div>
                <span className="rounded bg-white px-1 text-[8px] font-bold uppercase text-red-600">DEVICE</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center gap-2">
        <button
          onPointerDown={handleAction}
          className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-yellow-400 shadow-xl transition-transform active:scale-90"
        >
          <ChevronUp size={40} className="text-green-900" />
        </button>
        <p className="text-xs font-bold opacity-70">CHẠM ĐỂ NHẢY</p>
      </div>

      <div className="mt-auto flex flex-col items-center gap-1 pt-8 opacity-60">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-[10px]">
            <Milk size={12} /> 50-100đ: Sữa
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            <Gift size={12} /> &gt;100đ: Bình nước
          </div>
        </div>
        <p className="text-[8px]">© 2026 Nestlé Milo - Hệ thống CRM kết nối tự động</p>
      </div>
    </div>
  );
};

export default App;
