// @ts-nocheck
const omniston = useOmniston();


  const inputAsset = getAssetId(omniSourceChain, omniSourceToken);
  const outputAsset = getAssetId(omniDestChain, omniDestToken);

  const quoteRequest: QuoteRequest | undefined = React.useMemo(() => {
    if (!inputAsset || !outputAsset || !omniSourceAmount || Number(omniSourceAmount) <= 0) return undefined;
    return {
      inputAsset,
      outputAsset,
      amount: {
        $case: "inputUnits",
        value: (Number(omniSourceAmount) * 1e9).toFixed(0),
      },
      settlementParams: [
        {
          params: {
            $case: "swap",
            value: { maxPriceSlippagePips: 10_000, flexibleIntegratorFee: true },
          },
        },
        {
          params: {
            $case: "order",
            value: {},
          },
        }
      ]
    } as QuoteRequest;
  }, [inputAsset, outputAsset, omniSourceAmount]);

  const { data: quoteEvent } = useRfq(quoteRequest as any);
  const activeQuote = quoteEvent?.$case === 'quoteUpdated' ? quoteEvent.value : null;

  useEffect(() => {
    if (activeQuote && !isOmniSwapping) {
      setOmniDestAmount((Number(activeQuote.expectedOutput) / 1e9).toFixed(4));
    }
  }, [activeQuote, isOmniSwapping]);

  const executeOmniSwap = async () => {
    if (!activeQuote) {
      showNotificationMessage(lang === 'ru' ? 'Котировка не найдена. Подождите... ⚠️' : 'Quote not found. Please wait... ⚠️');
      return;
    }

    if (omniSourceChain === 'ton') {
      if (!walletAddress) {
        showNotificationMessage(lang === 'ru' ? 'Пожалуйста, подключите TON кошелек! 🔌' : 'Please connect TON wallet! 🔌');
        return;
      }

      setIsOmniSwapping(true);
      setOmniSwapStep(1);

      try {
        const traderAddress: ChainAddress = {
          chain: { $case: "ton", value: walletAddress },
        };

        if (activeQuote.settlementData?.$case === 'swap') {
          setOmniSwapStep(2);
          const swapTx = await omniston.tonBuildSwap({
            quoteId: activeQuote.quoteId,
            transferSrcAddress: traderAddress,
            refundSrcAddress: traderAddress,
            gasExcessAddress: traderAddress,
            traderDstAddress: traderAddress,
          });

          const messages = swapTx.messages.map((msg: any) => ({
            address: msg.targetAddress,
            amount: msg.tonAmount,
            payload: msg.payload
          }));

          setOmniSwapStep(3);
          const txResult = await tonConnectUI.sendTransaction({
            validUntil: Date.now() + 5 * 60 * 1000,
            messages
          });

          if (txResult) {
            setOmniTxHash('Processing...');
            setOmniSwapStep(4);
            
            const stream = await omniston.swapTrack({
              quoteId: activeQuote.quoteId,
              traderAddress,
              outgoingTxQuery: messages[0].payload,
            });

            stream.subscribe({
              next(event: any) {
                if (event?.$case === 'progress') {
                  if (event.value.status === 'completed') {
                    setOmniSwapStep(5);
                    setUserXp(prev => Math.min(prev + 200, 5000));
                    showNotificationMessage(lang === 'ru' ? 'Обмен успешно завершен! +200 XP 🚀' : 'Swap completed successfully! +200 XP 🚀');
                    setTimeout(() => {
                      setIsOmniSwapping(false);
                      setOmniSwapStep(0);
                      setShowOmnistonModal(false);
                      setOmniSourceAmount('');
                    }, 2500);
                  }
                }
              }
            });
          }
        } else {
          // Mock order flow for EVM or others temporarily
          simulateMockSwap();
        }
      } catch (err) {
        console.error('Omniston Swap Error:', err);
        showNotificationMessage(lang === 'ru' ? 'Ошибка транзакции ❌' : 'Transaction failed ❌');
        setIsOmniSwapping(false);
        setOmniSwapStep(0);
      }
    } else {
      // Mock flow for EVM -> TON since no EVM wallet is attached yet
      simulateMockSwap();
    }
  };

  const simulateMockSwap = () => {
    setOmniSwapStep(2);
    setTimeout(() => {
      setOmniSwapStep(3);
      const randomHash = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
      setOmniTxHash(randomHash);
      setTimeout(() => {
        setOmniSwapStep(4);
        setTimeout(() => {
          setOmniSwapStep(5);
          setUserXp(prev => Math.min(prev + 200, 5000));
          showNotificationMessage(
            lang === 'ru' 
              ? 'Кросс-чейн обмен (Mock) выполнен! Получено +200 XP 🚀🌐' 
              : 'Cross-Chain Swap (Mock) complete! Gained +200 XP 🚀🌐'
          );
          setTimeout(() => {
            setIsOmniSwapping(false);
            setOmniSwapStep(0);
            setShowOmnistonModal(false);
            setOmniSourceAmount('');
            setOmniDestAmount('0.0');
          }, 2500);
        }, 1800);
      }, 1800);
    }, 1200);
  };
