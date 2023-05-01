import { eEthereumNetwork, IAaveConfiguration } from "../../helpers/types";
import { AaveMarket } from "../aave/index";

// ----------------
// POOL--SPECIFIC PARAMS
// ----------------

export const EthereumV3Market: IAaveConfiguration = {
  ...AaveMarket,
  ProviderId: 30,
  WrappedNativeTokenSymbol: "WETH",
  MarketId: "Aave Ethereum Market",
  ATokenNamePrefix: "Ethereum",
  StableDebtTokenNamePrefix: "Ethereum",
  VariableDebtTokenNamePrefix: "Ethereum",
  SymbolPrefix: "Eth",
  ReserveAssets: {},
  ChainlinkAggregator: {},
  ReservesConfig: {},
  EModes: {},
  ReserveFactorTreasuryAddress: {
    [eEthereumNetwork.main]: "0x464c71f6c2f760dda6093dcb91c24c39e5d6e18c",
  },
  PythContract: "0x4305FB66699C3B2702D4d05CF36551390A4c69C6",
};

export default EthereumV3Market;
