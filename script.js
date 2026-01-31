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
        "[    0.000000] Hrvyland v0.9",
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
        <div className="h-screen w-screen bg-black text-[#a9b1d6] font-terminal flex items-center justify-center">
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

// --- コンポーネント3: メイン画面 (Hyprland風) ---

// --- 汎用的なウィンドウコンポーネント ---
const Window = ({ title, children, initialPosition, size, animationDelay, contentDelay, customClass, bgStyle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isContentVisible, setIsContentVisible] = useState(false);

    useEffect(() => {
        const openTimer = setTimeout(() => setIsOpen(true), animationDelay);
        const contentTimer = setTimeout(() => setIsContentVisible(true), animationDelay + contentDelay);

        return () => {
            clearTimeout(openTimer);
            clearTimeout(contentTimer);
        };
    }, [animationDelay, contentDelay]);

    const positionAndSize = {
        top: initialPosition.y,
        left: initialPosition.x,
        width: size.w,
        height: size.h,
    };

    return (
        <div
            className={`absolute transition-all duration-500 ease-out ${customClass || ''} ${isOpen ? 'opacity-100 transform-none' : 'opacity-0 translate-y-8'}`}
            style={positionAndSize}
        >
            <div className={`h-full w-full rounded-2xl shadow-2xl border border-slate-300/50 flex flex-col ${bgStyle}`}>
                {/* New minimal header, no close buttons */}
                <div className="p-3 border-b border-slate-300/70 flex-shrink-0">
                    <h3 className="text-sm font-medium text-slate-700 font-terminal text-center">
                        {title}
                    </h3>
                </div>

                {/* ウィンドウのコンテンツ */}
                <div className={`p-4 overflow-auto h-full transition-opacity duration-700 ${isContentVisible ? 'opacity-100' : 'opacity-0'}`}>
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- 各ウィンドウのコンテンツ ---

// 1. fastfetch風プロフィール
const FastFetchProfile = () => {
    const profile = {
        "Name": "Harvey",
        "Gender": "♂",
        "Age": "2-",
        "Education":"LLB",
        "From": "埼玉県",
        "Resides in": "東京都",
        "Note": "予定は未定"
    };
    const asciiLogo = `
          /\\
         /  \\
        /    \\
       /      \\
      /   ^_^  \\
     /          \\
    /____________\\
    `;

    return (
        <div className="font-terminal text-slate-600 flex space-x-4">
            <pre className="text-blue-400 leading-tight" style={{ fontSize: '0.8em' }}>{asciiLogo}</pre>
            <div className="border-l border-slate-400 pl-4">
                <p className="text-slate-800 font-bold">guest@harvey-desktop</p>
                <p>--------------------</p>
                {Object.entries(profile).map(([key, value]) => (
                    <p key={key}>
                        <span className="font-bold text-slate-700">{key}:</span> {value}
                    </p>
                ))}
            </div>
        </div>
    );
};

// 2. イメージビューア
const ImageViewer = () => {
    const images = [
        './images/slide1.jpg',
        './images/slide2.jpg',
        './images/slide3.jpg',
        './images/slide4.jpg',
        './images/slide5.jpg',
        './images/slide6.jpg',
        './images/slide7.jpg',
        './images/slide8.jpg',
    ];
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const slideInterval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
        }, 5000); // 5秒ごとに画像を切り替え

        return () => clearInterval(slideInterval); // コンポーネントのアンマウント時にタイマーをクリア
    }, []);

    return (
        <div className="w-full h-full flex items-center justify-center bg-black/20 rounded-lg">
            <img src={images[currentIndex]} alt={`キャラクター ${currentIndex + 1}`} className="max-h-full max-w-full object-contain drop-shadow-lg" />
        </div>
    );
};

// 3. ブラウザ
const Browser = () => (
    <div className="h-full flex flex-col text-xs font-sans text-slate-800">
        {/* URLバー */}
        <div className="flex-shrink-0 flex items-center bg-slate-200/60 p-1 rounded-md mb-2">
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            <div className="bg-white/50 text-slate-700 text-xs rounded-md px-3 py-1 ml-2 flex-grow">
                https://portal.harvey.net/
            </div>
        </div>
        
        {/* コンテンツエリア */}
        <div className="flex-grow overflow-y-auto p-1 space-y-2">
            {/* 検索とロゴ */}
            <div className="flex items-center space-x-2">
                <h1 className="font-kiwi text-blue-600 text-lg font-bold">Harvey!</h1>
                <div className="flex-grow flex">
                    <input type="text" className="w-full bg-white/70 border border-slate-300 rounded-l-md px-2 py-0.5 text-xs focus:outline-none" placeholder="キーワードを入力" />
                    <button className="bg-blue-500 text-white px-2 rounded-r-md">検索</button>
                </div>
            </div>

            {/* カテゴリリンク */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-blue-700">
                <a href="#" className="hover:underline">ニュース</a>
                <a href="#" className="hover:underline">天気</a>
                <a href="#" className="hover:underline">ファイナンス</a>
                <a href="#" className="hover:underline">ショッピング</a>
                <a href="#" className="hover:underline">ブログ</a>
                <a href="#" className="hover:underline">VRChat</a>
            </div>

            {/* メインコンテンツ (ニュースと天気) */}
            <div className="grid grid-cols-3 gap-2">
                {/* ニュースセクション */}
                <div className="col-span-2 space-y-1">
                    <h2 className="font-bold border-b border-slate-300">主要ニュース</h2>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                        <li><a href="#" className="hover:underline">Steam Frame 注目の新機能</a></li>
                        <li><a href="#" className="hover:underline">ClicksとUniherz 競争の行方</a></li>
                        <li><a href="#" className="hover:underline">CompTIA CySA+更新費用 民衆の怒り</a></li>
                        <li><a href="#" className="hover:underline">近所のパン屋 うまい</a></li>
                        <li><a href="#" className="hover:underline">サブスク解約忘れ 財政破綻</a></li>
                    </ul>
                    <div className="pt-1">
                        <img src="./images/news.png" alt="ニュース画像" className="w-full h-auto rounded-md" />
                    </div>
                </div>

                {/* 天気セクション */}
                <div className="space-y-1">
                    <h2 className="font-bold border-b border-slate-300">天気</h2>
                    <div className="bg-white/30 p-1 rounded-md text-center">
                        <p className="font-bold">凍京</p>
                        <p>☀️ 晴れ</p>
                        <p>-15℃ / -43℃</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// 4. リンク
const SocialLinks = () => (
    <div className="text-slate-700 font-terminal space-y-3">
        <h3 className="text-lg text-slate-800 border-b border-slate-300/70 pb-1 mb-3">~/Links</h3>
        <a href="https://x.com/HarveySupekuta" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:bg-black/5 p-1 rounded-md transition-colors">
            <img src="./images/Twitter.png" alt="Twitter Icon" className="w-6 h-6 rounded" />
            <span>Twitter</span>
        </a>
        <a href="https://vrchat.com/home/user/usr_d4d48c3d-4c5a-4d3a-9962-066a7e699a3a" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:bg-black/5 p-1 rounded-md transition-colors">
            <img src="./images/VRC.png" alt="VRChat Icon" className="w-6 h-6" />
            <span>VRChat</span>
        </a>
    </div>
);

// --- Waybar風ステータスバー ---
const Waybar = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const formattedTime = time.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    const formattedDate = time.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });

    return (
        <div className="absolute top-0 left-0 right-0 h-8 bg-black/20 backdrop-blur-md text-slate-800 font-terminal text-sm flex items-center justify-between px-4 z-10">
            {/* Left Section: WM Icon and Workspace */}
            <div className="flex items-center gap-4">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v16M20 4v16M4 12h16" /></svg>
                <span>[□□□■]</span>
            </div>

            {/* Center Section: Clock */}
            <div className="flex items-center gap-2">
                <span>{formattedDate}</span>
                <span className="font-bold text-base">{formattedTime}</span>
            </div>

            {/* Right Section: System Tray Icons */}
            <div className="flex items-center gap-4">
                {/* Wifi Icon */}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.555a5.5 5.5 0 017.778 0M4.875 12.125a12 12 0 0114.25 0M12 20.25h.01" /></svg>
                {/* Battery Icon */}
                <span>BAT 98%</span>
            </div>
        </div>
    );
};

// --- Custom Hook for Viewport ---
const useViewport = () => {
    const [isPortrait, setIsPortrait] = useState(window.innerWidth / window.innerHeight < 1);

    useEffect(() => {
        const handleResize = () => {
            setIsPortrait(window.innerWidth / window.innerHeight < 1);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return { isPortrait };
};

// --- メイン画面本体 ---
const MainScreen = () => {
    const [isMounted, setIsMounted] = useState(false);
    const { isPortrait } = useViewport();
    const windowBgTransparency = 'bg-slate-100/20 backdrop-blur-xl';

    useEffect(() => {
        // ページ遷移後にアニメーションを開始するためのフラグ
        const timer = setTimeout(() => setIsMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const landscapeLayout = {
        browser: { initialPosition: { x: '5%', y: '10%' }, size: { w: '35%', h: '35%' } },
        imageViewer: { initialPosition: { x: '55%', y: '25%' }, size: { w: '40%', h: '60%' } },
        profile: { initialPosition: { x: '8%', y: '60%' }, size: { w: '30%', h: '28%' } },
        links: { initialPosition: { x: '39%', y: '50%' }, size: { w: '15%', h: '20%' } },
    };

    const portraitLayout = {
        // 縦長のレイアウトではウィンドウを縦に並べる
        browser: { initialPosition: { x: '5%', y: '3%' }, size: { w: '90%', h: '25%' } },
        imageViewer: { initialPosition: { x: '5%', y: '30%' }, size: { w: '90%', h: '30%' } },
        profile: { initialPosition: { x: '5%', y: '62%' }, size: { w: '90%', h: '20%' } },
        links: { initialPosition: { x: '5%', y: '84%' }, size: { w: '90%', h: '15%' } },
    };

    const layout = isPortrait ? portraitLayout : landscapeLayout;

    return (
        // 背景。Hyprlandのデフォルト壁紙のようなグラデーション
        <div 
            className="h-screen w-screen overflow-hidden relative font-sans"
            style={{
                fontSize: 'calc(0.5vw + 8px)',
                backgroundImage: "url('./images/wallpaper.svg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <Waybar />
            
            {/* isMountedがtrueになったらウィンドウを表示開始 */}
            {isMounted && (
                <>
                    {/* 1. fastfetch風の自己紹介画面 */}
                    <Window
                        title="guest@harvey-desktop: ~"
                        initialPosition={layout.profile.initialPosition}
                        size={layout.profile.size}
                        animationDelay={600}
                        contentDelay={600}
                        bgStyle={windowBgTransparency}
                    >
                        <FastFetchProfile />
                    </Window>

                    {/* 2. キャラクター画像 */}
                    <Window
                        title="ImageViewer"
                        initialPosition={layout.imageViewer.initialPosition}
                        size={layout.imageViewer.size}
                        animationDelay={400}
                        contentDelay={500}
                        customClass="flex items-center justify-center"
                        bgStyle={windowBgTransparency}
                    >
                        <ImageViewer />
                    </Window>
                    
                    {/* 3. ブラウザ風画面 */}
                    <Window
                        title="Browser"
                        initialPosition={layout.browser.initialPosition}
                        size={layout.browser.size}
                        animationDelay={200}
                        contentDelay={400}
                        bgStyle={windowBgTransparency}
                    >
                        <Browser />
                    </Window>

                    {/* 4. リンク画面 */}
                    <Window
                        title="Links"
                        initialPosition={layout.links.initialPosition}
                        size={layout.links.size}
                        animationDelay={700}
                        contentDelay={600}
                        bgStyle={windowBgTransparency}
                    >
                        <SocialLinks />
                    </Window>
                </>
            )}

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