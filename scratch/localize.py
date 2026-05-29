import re

file_path = r"c:\Users\danii\Desktop\STONHUB\app\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add connectWalletBtn to DICTIONARY
dict_ru_pattern = r"(ru:\s*\{.*?walletConnectSuccess:\s*'[^\']+',)"
dict_en_pattern = r"(en:\s*\{.*?walletConnectSuccess:\s*'[^\']+',)"

content = re.sub(
    dict_ru_pattern,
    r"\1\n    connectWalletBtn: 'Подключить кошелек',",
    content,
    flags=re.DOTALL
)
content = re.sub(
    dict_en_pattern,
    r"\1\n    connectWalletBtn: 'Connect Wallet',",
    content,
    flags=re.DOTALL
)

# 2. Replace broken chunk at the top of export default function Home()
broken_pattern = r"export default function Home\(\)\s*\{\s*text:\s*\"Кстати, о бабках\..*?export default function Home\(\)\s*\{"
home_init_code = """export default function Home() {
  // === Language States ===
  const [lang, setLang] = useState<'ru' | 'en'>('ru');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('stonhub_lang');
    if (saved === 'ru' || saved === 'en') {
      setLang(saved);
    }
  }, []);

  const toggleLang = () => {
    const nextLang = lang === 'ru' ? 'en' : 'ru';
    setLang(nextLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('stonhub_lang', nextLang);
    }
  };

  const TUTORIAL_STEPS = getTutorialSteps(lang);"""

content, count = re.subn(broken_pattern, home_init_code, content, flags=re.DOTALL)
print(f"Replaced broken home chunk: {count}")

# 3. Replace videoFilter state category default and category mapping
content = content.replace("const [videoFilter, setVideoFilter] = useState<string>('Гайды');", "const [videoFilter, setVideoFilter] = useState<string>('guides');")
content = content.replace("const filteredLessons = videoFilter === 'Гайды' ? lessons : [];", "const filteredLessons = videoFilter === 'guides' ? lessons : [];")

categories_scroll_old = """                    {/* Horizontal Categories Scroll */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
                      {['Гайды', 'Видео'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setVideoFilter(cat)}
                          className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border shrink-0 transition-all ${
                            videoFilter === cat
                              ? 'bg-[#FF9900] text-black border-[#FF9900] shadow-sm'
                              : 'bg-neutral-900 text-neutral-400 border-white/5 hover:border-white/10'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>"""

categories_scroll_new = """                    {/* Horizontal Categories Scroll */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
                      {[
                        { key: 'guides', label: lang === 'ru' ? 'Гайды' : 'Guides' },
                        { key: 'videos', label: lang === 'ru' ? 'Видео' : 'Videos' }
                      ].map(cat => (
                        <button
                          key={cat.key}
                          onClick={() => setVideoFilter(cat.key)}
                          className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border shrink-0 transition-all ${
                            videoFilter === cat.key
                              ? 'bg-[#FF9900] text-black border-[#FF9900] shadow-sm'
                              : 'bg-neutral-900 text-neutral-400 border-white/5 hover:border-white/10'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>"""

content = content.replace(categories_scroll_old, categories_scroll_new)
content = content.replace("videoFilter === 'Видео' ? (", "videoFilter === 'videos' ? (")

# 4. Replace huge mock data definitions inside Home()
mock_data_old_pattern = r"// === Mock Data ===.*?const \[leaders, setLeaders\] = useState<Leader\[\]>\(\[.*?\]\);"
mock_data_replacement = """// === Mock Data with multi-language synchronization ===
  const [lessons, setLessons] = useState<Lesson[]>(() => getLessons('ru'));
  const [missions, setMissions] = useState<Mission[]>(() => getMissions('ru'));
  const [leaders, setLeaders] = useState<Leader[]>(() => getLeaders('ru'));

  // Synchronize dynamic localized lists when lang updates
  useEffect(() => {
    // 1. Lessons
    const freshLessons = getLessons(lang);
    setLessons(freshLessons);

    // 2. Missions
    const freshMissions = getMissions(lang);
    setMissions(prev => {
      return freshMissions.map(fresh => {
        const existing = prev.find(m => m.id === fresh.id);
        return {
          ...fresh,
          status: existing ? existing.status : fresh.status
        };
      });
    });

    // 3. Leaders
    const freshLeaders = getLeaders(lang);
    setLeaders(prev => {
      return freshLeaders.map(fresh => {
        const existing = prev.find(l => l.rank === fresh.rank || l.isCurrentUser === fresh.isCurrentUser);
        if (fresh.isCurrentUser && existing) {
          let currentName = fresh.name;
          if (tgUser) {
            currentName = tgUser.username ? `@${tgUser.username} (${lang === 'ru' ? 'Вы' : 'You'})` : `${tgUser.firstName} (${lang === 'ru' ? 'Вы' : 'You'})`;
          }
          return {
            ...fresh,
            name: currentName,
            xp: userXp,
            badge: userRank
          };
        }
        return fresh;
      });
    });
  }, [lang, tgUser, userXp, userRank]);"""

content, count = re.subn(mock_data_old_pattern, mock_data_replacement, content, flags=re.DOTALL)
print(f"Replaced mock data chunk: {count}")

# 5. Connect wallet connects and alerts
content = content.replace("showNotificationMessage('Добро пожаловать в игру! 🪨🔥');", "showNotificationMessage(DICTIONARY[lang].walletConnectSuccess);")
content = content.replace("showNotificationMessage('Бонус собран! Получено +25 XP ⚡');", "showNotificationMessage(DICTIONARY[lang].dailyClaimSuccess);")
content = content.replace("showNotificationMessage('Задание отправлено на проверку! ⏳');", "showNotificationMessage(DICTIONARY[lang].missionPendingAlert);")
content = content.replace("showNotificationMessage(`Задание проверено! Получено +${mission.xpReward} XP 🎉`);", "showNotificationMessage(`${DICTIONARY[lang].missionCompletedAlert}${mission.xpReward} XP 🎉`);")
content = content.replace("showNotificationMessage('Пожалуйста, подключите TON кошелек! 🔌');", "showNotificationMessage(DICTIONARY[lang].walletAlert);")
content = content.replace("showNotificationMessage('Введите сумму для обмена! ⚠️');", "showNotificationMessage(DICTIONARY[lang].swapAmountAlert);")
content = content.replace("showNotificationMessage(`Обмен выполнен! Получено +100 XP 🚀`);", "showNotificationMessage(DICTIONARY[lang].swapSuccess);")
content = content.replace("showNotificationMessage('Пожалуйста, кликните кнопку кошелька в шапке! 🔌');", "showNotificationMessage(DICTIONARY[lang].connectWalletAlert);")

# 6. Translate Header & Price Bar
header_old_code = """          <div className="scale-[0.9] origin-right">
            {walletAddress ? (
              <button 
                onClick={() => tonConnectUI.disconnect()}
                className="bg-neutral-900 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-[10px] font-black text-emerald-400 flex items-center gap-1.5 shadow-sm active:scale-95 transition"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}</span>
              </button>
            ) : (
              <button 
                onClick={() => tonConnectUI.openModal()}
                className="bg-gradient-to-tr from-[#FF9900] to-[#FF5500] hover:from-[#FF5500] hover:to-[#FF9900] text-black px-3.5 py-1.5 rounded-xl text-[10px] font-black shadow-lg shadow-[#FF9900]/10 hover:shadow-[#FF9900]/25 active:scale-95 transition whitespace-nowrap"
              >
                Connect Wallet
              </button>
            )}
          </div>"""

header_new_code = """          <div className="flex items-center gap-2.5">
            {/* Premium segmented language toggle */}
            <div className="flex items-center p-0.5 bg-neutral-900/60 backdrop-blur border border-white/10 rounded-xl relative overflow-hidden h-[30px] w-[70px]">
              <div 
                className={`absolute top-0.5 bottom-0.5 w-[31px] rounded-lg bg-[#FF9900] shadow-md shadow-[#FF9900]/20 transition-all duration-300 ${
                  lang === 'en' ? 'left-[36px]' : 'left-0.5'
                }`}
              />
              <button 
                onClick={() => lang !== 'ru' && toggleLang()}
                className={`flex-1 text-[10px] font-black z-10 text-center transition-colors duration-200 ${
                  lang === 'ru' ? 'text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                RU
              </button>
              <button 
                onClick={() => lang !== 'en' && toggleLang()}
                className={`flex-1 text-[10px] font-black z-10 text-center transition-colors duration-200 ${
                  lang === 'en' ? 'text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            <div className="scale-[0.9] origin-right">
              {walletAddress ? (
                <button 
                  onClick={() => tonConnectUI.disconnect()}
                  className="bg-neutral-900 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-[10px] font-black text-emerald-400 flex items-center gap-1.5 shadow-sm active:scale-95 transition whitespace-nowrap"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}</span>
                </button>
              ) : (
                <button 
                  onClick={() => tonConnectUI.openModal()}
                  className="bg-gradient-to-tr from-[#FF9900] to-[#FF5500] hover:from-[#FF5500] hover:to-[#FF9900] text-black px-3.5 py-1.5 rounded-xl text-[10px] font-black shadow-lg shadow-[#FF9900]/10 hover:shadow-[#FF9900]/25 active:scale-95 transition whitespace-nowrap"
                >
                  {DICTIONARY[lang].connectWalletBtn}
                </button>
              )}
            </div>
          </div>"""

content = content.replace(header_old_code, header_new_code)
content = content.replace('<span className="text-neutral-400 font-medium">Цена STON.fi:</span>', '<span className="text-neutral-400 font-medium">{lang === \'ru\' ? \'Цена STON.fi:\' : \'STON.fi Price:\'}</span>')

# 7. Onboarding Tutorial guide elements
content = content.replace('<h4 className="text-[10px] font-black text-[#FF9900] uppercase tracking-wider mb-1">Проводник STONHub 🗿</h4>', '<h4 className="text-[10px] font-black text-[#FF9900] uppercase tracking-wider mb-1">{DICTIONARY[lang].guideName}</h4>')
content = content.replace('Пропустить', '{DICTIONARY[lang].skip}')
content = content.replace("{tutorialStep === TUTORIAL_STEPS.length - 1 ? 'Погнали! 🚀' : 'Дальше →'}", "{tutorialStep === TUTORIAL_STEPS.length - 1 ? DICTIONARY[lang].finish : DICTIONARY[lang].next}")

# 8. Home Dashboard mappings
content = content.replace("Привет, ${tgUser.username ? `@${tgUser.username}` : tgUser.firstName}", "${DICTIONARY[lang].hiUser}${tgUser.username ? `@${tgUser.username}` : tgUser.firstName}")
content = content.replace("'Привет, Амбассадор!'", "DICTIONARY[lang].hiAmbassador")
content = content.replace("Ранг: <span className=\"text-white font-semibold\">{userRank}</span>", "<span className=\"text-neutral-400 font-medium\">{DICTIONARY[lang].rankLabel}</span><span className=\"text-white font-semibold\">{userRank}</span>")
content = content.replace('<span className="text-neutral-400 font-medium">Твой прогресс:</span>', '<span className="text-neutral-400 font-medium">{DICTIONARY[lang].progressLabel}</span>')
content = content.replace('<span className="italic font-medium">+{5000 - userXp} XP до ранга Diamond Vibe 💎</span>', '<span className="italic font-medium">+{5000 - userXp} XP {DICTIONARY[lang].nextRankText}</span>')
content = content.replace('<span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Баланс $STON</span>', '<span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">{DICTIONARY[lang].balanceLabel}</span>')
content = content.replace(' за 7д', ' {DICTIONARY[lang].sevenDaysText}')
content = content.replace('<h4 className="text-[10px] text-neutral-500 uppercase font-black tracking-widest pl-1 mb-2">Быстрые действия</h4>', '<h4 className="text-[10px] text-neutral-500 uppercase font-black tracking-widest pl-1 mb-2">{DICTIONARY[lang].quickActions}</h4>')
content = content.replace('<span className="text-[9px] font-bold text-white uppercase">Миссии</span>', '<span className="text-[9px] font-bold text-white uppercase">{lang === \'ru\' ? \'Миссии\' : \'Missions\'}</span>')
content = content.replace('<span className="text-[9px] font-bold text-white uppercase">Академия</span>', '<span className="text-[9px] font-bold text-white uppercase">{lang === \'ru\' ? \'Академия\' : \'Academy\'}</span>')
content = content.replace('<span className="text-[9px] font-bold text-white uppercase">Своп</span>', '<span className="text-[9px] font-bold text-white uppercase">{DICTIONARY[lang].swapActionBtn}</span>')
content = content.replace('<span className="text-[9px] font-bold text-white uppercase">Бонусы</span>', '<span className="text-[9px] font-bold text-white uppercase">{DICTIONARY[lang].dailyClaimBtn}</span>')
content = content.replace('<h3 className="font-bold text-xs text-white">Добро пожаловать в STON Hub!</h3>', '<h3 className="font-bold text-xs text-white">{DICTIONARY[lang].welcomeTitle}</h3>')
content = content.replace('Это твой интераквить путеводитель по блокчейну TON и экосистеме STON.fi. Смотри обучающие видео, сдавай тесты, выполняй квесты и докажи, что ты лучший амбассадор!', '{DICTIONARY[lang].welcomeDesc}')
content = content.replace('Это твой интерактивный путеводитель по блокчейну TON и экосистеме STON.fi. Смотри обучающие видео, сдавай тесты, выполняй квесты и докажи, что ты лучший амбассадор!', '{DICTIONARY[lang].welcomeDesc}')
content = content.replace('<span>Перейти к обучению</span>', '<span>{DICTIONARY[lang].goToAcademy}</span>')
content = content.replace('<p className="text-[8px] text-neutral-500 uppercase font-black">Выполнено квестов</p>', '<p className="text-[8px] text-neutral-500 uppercase font-black">{DICTIONARY[lang].completedQuests}</p>')
content = content.replace('<p className="text-[8px] text-neutral-500 uppercase font-black">Пройдено уроков</p>', '<p className="text-[8px] text-neutral-500 uppercase font-black">{DICTIONARY[lang].completedLessons}</p>')
content = content.replace('<p className="text-[8px] text-neutral-500 uppercase font-black">Сейвинг APY</p>', '<p className="text-[8px] text-neutral-500 uppercase font-black">{DICTIONARY[lang].savingApy}</p>')

# 9. Academy detailed views mappings
content = content.replace('← К списку гайдов', '{DICTIONARY[lang].backToList}')
content = content.replace('<span>Учебный материал</span>', '<span>{DICTIONARY[lang].studyMaterial}</span>')
content = content.replace('Время чтения: {selectedLesson.readTime}', '{DICTIONARY[lang].readTime} {selectedLesson.readTime}')
content = content.replace('<span>Пройдите тест для получения +{selectedLesson.xpReward} XP:</span>', '<span>{DICTIONARY[lang].quizPrompt}{selectedLesson.xpReward} XP:</span>')
content = content.replace('<span>Задание успешно выполнено! Награда начислена.</span>', '<span>{DICTIONARY[lang].quizSuccess}</span>')
content = content.replace('<h2 className="text-base font-black text-white">Академия STONHub 🎓</h2>', '<h2 className="text-base font-black text-white">{DICTIONARY[lang].academyTitle}</h2>')
content = content.replace('<p className="text-[11px] text-neutral-400">Читай гайды, отвечай на тесты и прокачивайся</p>', '<p className="text-[11px] text-neutral-400">{DICTIONARY[lang].academyDesc}</p>')
content = content.replace('videoFilter === \'Гайды\' ? `Всего гайдов: ${filteredLessons.length}` : \'Скоро\'', "videoFilter === 'guides' ? `${DICTIONARY[lang].totalGuides} ${filteredLessons.length}` : (lang === 'ru' ? 'Скоро' : 'Soon')")
content = content.replace('Сдано', '{DICTIONARY[lang].completed}')
content = content.replace('Читать гайд', '{DICTIONARY[lang].readGuide}')

# 10. Missions Tab
content = content.replace('<h2 className="text-base font-black text-white">Доступные квесты 🎯</h2>', '<h2 className="text-base font-black text-white">{DICTIONARY[lang].missionsTitle}</h2>')
content = content.replace('<p className="text-[11px] text-neutral-400">Выполняйте задания каждый день и получайте амбассадорские награды</p>', '<p className="text-[11px] text-neutral-400">{DICTIONARY[lang].missionsDesc}</p>')
content = content.replace('<CheckCircle2 className="w-3 h-3" /> Выполнено', '<CheckCircle2 className="w-3 h-3" /> {DICTIONARY[lang].done}')
content = content.replace('<RefreshCw className="w-3 h-3 animate-spin" /> Проверка', '<RefreshCw className="w-3 h-3 animate-spin" /> {DICTIONARY[lang].pending}')
content = content.replace('Начать', '{DICTIONARY[lang].start}')
content = content.replace('<h3 className="font-bold text-xs text-white">Реферальная программа</h3>', '<h3 className="font-bold text-xs text-white">{DICTIONARY[lang].referralTitle}</h3>')
content = content.replace('Приглашай друзей в STON Hub и получай <strong className="text-white">15%</strong> от их накопленного XP в экосистеме.', '{DICTIONARY[lang].referralDesc}')

# 11. Profile Tab
content = content.replace('<h2 className="text-base font-black text-white flex items-center gap-1.5">\n                          <Trophy className="w-5 h-5 text-[#FF9900]" /> Лидерборд\n                        </h2>', '<h2 className="text-base font-black text-white flex items-center gap-1.5"><Trophy className="w-5 h-5 text-[#FF9900]" /> {DICTIONARY[lang].leaderboardTitle}</h2>')
content = content.replace('← Профиль', '{DICTIONARY[lang].backToProfile}')
content = content.replace('<span>Амбассадор</span>', '<span>{DICTIONARY[lang].tableAmbassador}</span>')
content = content.replace('<span>Очки XP</span>', '<span>{DICTIONARY[lang].tableXp}</span>')
content = content.replace("<p className=\"text-xs font-black text-white\">Твой рейтинг (Вы)</p>", "<p className=\"text-xs font-black text-white\">{lang === 'ru' ? 'Твой рейтинг (Вы)' : 'Your rank (You)'}</p>")
content = content.replace('<span className="text-[9px] font-bold text-neutral-500">В рейтинге: #4</span>', '<span className="text-[9px] font-bold text-neutral-500">{lang === \'ru\' ? \'В рейтинге: #4\' : \'Ranked: #4\'}</span>')
content = content.replace('<span>Твой уровень</span>', '<span>{DICTIONARY[lang].yourLevel}</span>')
content = content.replace('<p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mt-1">ОФИЦИАЛЬНЫЙ АМБАССАДОР STON.fi</p>', '<p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mt-1">{DICTIONARY[lang].officialAmbassador}</p>')
content = content.replace('<h4 className="text-[10px] text-neutral-500 uppercase font-black tracking-widest pl-1">Статистика</h4>', '<h4 className="text-[10px] text-neutral-500 uppercase font-black tracking-widest pl-1">{DICTIONARY[lang].statsTitle}</h4>')
content = content.replace('<span className="text-[8px] text-neutral-500 uppercase font-black block">Миссии выполнено</span>', '<span className="text-[8px] text-neutral-500 uppercase font-black block">{DICTIONARY[lang].statsQuests}</span>')
content = content.replace('<span className="text-[8px] text-neutral-500 uppercase font-black block">Друзей приглашено</span>', '<span className="text-[8px] text-neutral-500 uppercase font-black block">{DICTIONARY[lang].statsFriends}</span>')
content = content.replace('<span className="text-[8px] text-neutral-500 uppercase font-black block">Общий заработок</span>', '<span className="text-[8px] text-neutral-500 uppercase font-black block">{DICTIONARY[lang].statsEarnings}</span>')
content = content.replace('<span>В рейтинге</span>', '<span>{DICTIONARY[lang].statsRanking}</span>')
content = content.replace('<h4 className="text-[10px] text-neutral-500 uppercase font-black tracking-widest">Достижения</h4>', '<h4 className="text-[10px] text-neutral-500 uppercase font-black tracking-widest">{DICTIONARY[lang].achievementsTitle}</h4>')
content = content.replace('Смотреть все', '{DICTIONARY[lang].viewAll}')
content = content.replace('<span className="text-[8px] font-black text-neutral-400">Стрик 7д</span>', '<span className="text-[8px] font-black text-neutral-400">{DICTIONARY[lang].badgeStreak}</span>')
content = content.replace('<span className="text-[8px] font-black text-neutral-400">DeFi Гуру</span>', '<span className="text-[8px] font-black text-neutral-400">{DICTIONARY[lang].badgeGuru}</span>')
content = content.replace('<span className="text-[8px] font-black text-neutral-400">Топ Свапер</span>', '<span className="text-[8px] font-black text-neutral-400">{DICTIONARY[lang].badgeSwaper}</span>')
content = content.replace('<span className="text-[8px] font-black text-neutral-500">Крипто-Царь</span>', '<span className="text-[8px] font-black text-neutral-500">{DICTIONARY[lang].badgeKing}</span>')

# 12. Bottom Navigation
content = content.replace('<span className="text-[9px] font-black uppercase">Главная</span>', '<span className="text-[9px] font-black uppercase">{lang === \'ru\' ? \'Главная\' : \'Home\'}</span>')
content = content.replace('<span className="text-[9px] font-black uppercase">Академия</span>', '<span className="text-[9px] font-black uppercase">{lang === \'ru\' ? \'Академия\' : \'Academy\'}</span>')
content = content.replace('<span className="text-[9px] font-black uppercase">Миссии</span>', '<span className="text-[9px] font-black uppercase">{lang === \'ru\' ? \'Миссии\' : \'Missions\'}</span>')
content = content.replace('<span className="text-[9px] font-black uppercase">Профиль</span>', '<span className="text-[9px] font-black uppercase">{lang === \'ru\' ? \'Профиль\' : \'Profile\'}</span>')

# 13. Swap Modal elements
content = content.replace('<span>Вы отправляете:</span>', '<span>{DICTIONARY[lang].swapSend}</span>')
content = content.replace('<span>Баланс: {SWAP_TOKENS[swapFromToken].balance} {swapFromToken}</span>', '<span>{DICTIONARY[lang].swapBalance} {SWAP_TOKENS[swapFromToken].balance} {swapFromToken}</span>')
content = content.replace('<span>Вы получаете:</span>', '<span>{DICTIONARY[lang].swapReceive}</span>')
content = content.replace('<span>Баланс: {SWAP_TOKENS[swapToToken].balance} {swapToToken}</span>', '<span>{DICTIONARY[lang].swapBalance} {SWAP_TOKENS[swapToToken].balance} {swapToToken}</span>')
content = content.replace('<span>Курс обмена:</span>', '<span>{DICTIONARY[lang].swapRate}</span>')
content = content.replace('<span>Вайб-Бонус за сделку:</span>', '<span>{DICTIONARY[lang].swapBonus}</span>')
content = content.replace('<span>Выполняется обмен на STON.fi...</span>', '<span>{DICTIONARY[lang].swappingProgress}</span>')
content = content.replace("<span>{walletAddress ? 'Обменять токены' : 'Сначала подключите кошелек'}</span>", "<span>{walletAddress ? DICTIONARY[lang].swapButtonActive : DICTIONARY[lang].swapButtonInactive}</span>")
content = content.replace('Закрыть', '{DICTIONARY[lang].close}')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Localization script ran successfully!")
