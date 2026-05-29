import re

def get_asset_id_helper():
    return """
// Helper to map our local chains/tokens to Omniston AssetId
const getAssetId = (chain: string, token: string): AssetId | null => {
  if (chain === 'ton') {
    if (token === 'TON') {
      return { chain: { $case: "ton", value: { kind: { $case: "native" } } } };
    }
    if (token === 'STON') {
      return { chain: { $case: "ton", value: { kind: { $case: "jetton", value: "EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO" } } } };
    }
    if (token === 'USDT') {
      return { chain: { $case: "ton", value: { kind: { $case: "jetton", value: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs" } } } };
    }
  } else if (chain === 'base') {
    if (token === 'ETH') return { chain: { $case: "base", value: { kind: { $case: "native" } } } };
    if (token === 'USDC') return { chain: { $case: "base", value: { kind: { $case: "erc20", value: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" } } } };
  } else if (chain === 'polygon') {
    if (token === 'POL') return { chain: { $case: "polygon", value: { kind: { $case: "native" } } } };
    if (token === 'USDC') return { chain: { $case: "polygon", value: { kind: { $case: "erc20", value: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359" } } } };
  }
  return null;
};
"""
