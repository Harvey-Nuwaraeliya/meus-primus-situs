const { useState, useEffect, useRef } = React;

// フェーズ定数
const PHASE = {
    BOOT: 'boot',
    LOGIN: 'login',
    MAIN: 'main'
};

// --- コンポーネント1: ロード画面 ---
const BootScreen = ({ onComplete }) => {
    const [logs, setLogs] = useState([]);
    const bootLogs = [ 
        "[    0.000000] Harveyのウェブサイト v0.9",
        "[    0.000000] Command line: entry=index.html mode=Jikoshoukai",
        "[    0.034211] Initializing render engine...",
        "[    0.152331] Viewport detected, preparing render surface.",
        "[    0.455122] Calibrating connection...",
        "[    0.671003] Loading assets... [fonts, styles, scripts]",
        "[    0.992110] [OK] Mounted Google Fonts (Kiwi Maru, JetBrains Mono).",
        "[    1.200112] [OK] Parsed CSS animations.",
        "[    1.450022] [OK] Initialized React DOM.",
        "[    1.600123] Starting renderer... preparing for user login.",
        "[    1.800000] [OK] Reached target Interactive Mode.",
        "[    2.000000] Welcome, my friend!"
    ];

    useEffect(() => {
        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex < bootLogs.length) {
                setLogs(prev => [...prev, bootLogs[currentIndex]]);
                currentIndex++;
            } else {
                clearInterval(interval);
                setTimeout(onComplete, 500); // 完了後少し待って次へ
            }
        }, 150); // ログが流れる速度

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-screen w-screen bg-black text-white font-terminal text-xs p-4 overflow-hidden flex flex-col justify-end">
            {logs.map((log, i) => (
                <div key={i} className="whitespace-pre-wrap">{log}</div>
            ))}
            {logs.length < bootLogs.length && <div className="animate-pulse">_</div>}
        </div>
    );
};

// --- コンポーネント2:---
const LyScreen = ({ onComplete }) => {
    const [step, setStep] = useState(0); // 0:表示, 1:入力中, 2:完了
    const [passwordText, setPasswordText] = useState('');
    const password = "********";

    useEffect(() => {
        // 自動入力演出
        const timer1 = setTimeout(() => setStep(1), 800);
        const timer2 = setTimeout(() => setStep(2), 1800);
        const timer3 = setTimeout(onComplete, 2500);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, []);

    // stepが2になったらパスワードをタイピング風に表示
    useEffect(() => {
        if (step === 2) {
            const typingInterval = setInterval(() => {
                // 関数型アップデートを使い、現在のstateを元に次のstateを決定する
                setPasswordText(currentPassword => {
                    // すでにパスワードが完成していれば、インターバルを停止して現在の値を返す
                    if (currentPassword.length >= password.length) {
                        clearInterval(typingInterval);
                        return currentPassword;
                    }
                    // 次の文字を現在のパスワードに追加して返す
                    return currentPassword + password[currentPassword.length];
                });
            }, 50); // 1文字あたりのディレイ（ミリ秒）

            return () => clearInterval(typingInterval);
        }
    }, [step]);

    return (
        <div className="h-screen w-screen bg-[#1a1b26] text-[#a9b1d6] font-terminal flex items-center justify-center">
            <div className="border-2 border-[#414868] p-8 w-[400px] shadow-lg relative">
                {/* 擬似的なLyのUI */}
                <div className="absolute top-[-12px] left-4 bg-[#1a1b26] px-2 text-[#7aa2f7] font-bold">
                    Rye v0.6.0
                </div>
                
                <div className="space-y-4">
                    <div className="flex justify-between">
                        <span>login:</span>
                        <span className="text-[#c0caf5]">
                            {step >= 1 ? "guest" : ""}{step === 0 && <span className="cursor-blink">_</span>}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>password:</span>
                        <span>
                            {passwordText}
                            {step === 1 && <span className="cursor-blink">_</span>}
                        </span>
                    </div>
                    
                    <div className="mt-8 border-t border-[#414868] pt-2 text-xs text-[#565f89] text-center">
                        F1: shutdown | F2: reboot | F3: shell
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- コンポーネント3: メイン画面 ---
const MainScreen = () => {
    const [animationState, setAnimationState] = useState('waiting'); // waiting -> thrown -> landed
    const [characterImage, setCharacterImage] = useState('./images/character_fall.png');
    
    useEffect(() => {
        // マウント直後にアニメーション開始
        setAnimationState('thrown');
        
        // 0.8秒後に着地（シェイク開始）
        const landTimer = setTimeout(() => {
            setAnimationState('landed');
        }, 800); // CSSのthrowIn時間と合わせる

        return () => clearTimeout(landTimer);
    }, []);

    // animationStateが 'landed' に変わったのを監視して画像を切り替える
    useEffect(() => {
        if (animationState === 'landed') {
            // 0.5秒後に画像を切り替える
            const switchImageTimer = setTimeout(() => {
                setCharacterImage('./images/character_normal.png');
            }, 500);

            return () => clearTimeout(switchImageTimer);
        }
    }, [animationState]);

    return (
        // 画面全体。着地(landed)時にシェイクする
        <div className={`h-screen w-screen overflow-hidden bg-[#e4eff0] relative flex items-center justify-center ${animationState === 'landed' ? 'animate-impact-shake' : ''}`}>
            
            {/* 左上ロゴ */}
            <div className="absolute top-8 left-8 z-10">
                <h1 className="font-kiwi text-6xl text-[#edd8ec] text-outline tracking-widest">
                    ハービーのへや
                </h1>
                 </div>

            {/* 中央コンテナ */}
            <div className="container mx-auto w-full h-full flex flex-col md:flex-row relative px-4 sm:px-8">
                
                {/* 左：自己紹介エリア */}
                <div className="w-full md:w-1/2 h-auto md:h-full flex flex-col justify-center items-center md:items-start pt-32 md:pt-0 z-10">
                    <div className={`transition-opacity duration-1000 delay-1000 ${animationState === 'landed' ? 'opacity-100' : 'opacity-0'}`}>
                        <h2 className="font-kiwi text-6xl text-[#edd8ec] text-outline mb-6 text-center md:text-left">
                            わたしについて
                        </h2>
                        <p className="font-kiwi text-xl text-gray-600 leading-loose bg-white/50 p-6 rounded-lg backdrop-blur-sm shadow-sm border-l-4 border-[#edd8ec] text-center md:text-left">
                            名前:Harvey<br/>
                            性別:♂<br/>
                            年齢:?<br/>
                            趣味:散歩、映画/ドラマ、紅茶<br/>
                            生まれ:埼玉県<br/>
                            在住:東京都<br/>
                            なんかそれっぽいことを書いといてください。
                            わからないです。
                        </p>
                    </div>
                </div>

                {/* 右：キャラクターエリア */}
                <div className="w-1/2 h-full relative flex items-center justify-center">
                    {/* キャラクター画像コンテナ */}
                    <div className={`w-[750px] h-[750px] absolute right-[-100px] ${animationState !== 'waiting' ? 'animate-throw-in' : 'opacity-0'}`}>
                        <div className="w-full h-full relative group">
                            {/* キャラ画像：しりもちをついて着地するので、画像自体も着地時に少しバウンドさせる */}
                            <img 
                                src={characterImage} 
                                alt="キャラクター" 
                                className={`w-full h-full object-contain drop-shadow-2xl ${animationState === 'landed' ? 'animate-butt-bounce' : ''}`}
                            />
                            
                        </div>
                    </div>
                </div>
            </div>

            {/* 装飾レイヤー */}
            <div className="absolute inset-0 pointer-events-none opacity-5 overflow-hidden">
                <div className="font-terminal text-6xl text-black rotate-[-10deg] absolute top-[-50px] left-[-50px]">
                    sudo pacman -Syu
                </div>
                <div className="font-terminal text-8xl text-black rotate-[5deg] absolute bottom-10 right-[-100px]">
                    :wq
                </div>
            </div>

        </div>
    );
};

// --- ルートコンポーネント: 全体の流れ制御 ---
const App = () => {
    const [phase, setPhase] = useState(PHASE.BOOT);

    return (
        <div>
            {phase === PHASE.BOOT && (
                <BootScreen onComplete={() => setPhase(PHASE.LOGIN)} />
            )}
            {phase === PHASE.LOGIN && (
                <LyScreen onComplete={() => setPhase(PHASE.MAIN)} />
            )}
            {phase === PHASE.MAIN && (
                <MainScreen />
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);