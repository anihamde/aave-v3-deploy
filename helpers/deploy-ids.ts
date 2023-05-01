import { MARKET_NAME } from "./env";

export const POOL_ADDRESSES_PROVIDER_ID = `PoolAddressesProvider-${MARKET_NAME}`;
export const ACL_MANAGER_ID = `ACLManager-${MARKET_NAME}`;
export const IMPL_ID = "Implementation";
export const PROXY_ID = "Proxy";
export const POOL_IMPL_ID = `Pool-${IMPL_ID}`;
export const L2_POOL_IMPL_ID = `L2Pool-${IMPL_ID}`;
export const POOL_CONFIGURATOR_IMPL_ID = `PoolConfigurator-${IMPL_ID}`;
export const POOL_PROXY_ID = `Pool-${PROXY_ID}-${MARKET_NAME}`;
export const POOL_CONFIGURATOR_PROXY_ID = `PoolConfigurator-${PROXY_ID}-${MARKET_NAME}`;
export const POOL_DATA_PROVIDER = `PoolDataProvider-${MARKET_NAME}`;
export const ATOKEN_IMPL_ID = `AToken-${MARKET_NAME}`;
export const DELEGATION_AWARE_ATOKEN_IMPL_ID = `DelegationAwareAToken-${MARKET_NAME}`;
export const STABLE_DEBT_TOKEN_IMPL_ID = `StableDebtToken-${MARKET_NAME}`;
export const VARIABLE_DEBT_TOKEN_IMPL_ID = `VariableDebtToken-${MARKET_NAME}`;
export const RESERVES_SETUP_HELPER_ID = "ReservesSetupHelper";
export const INCENTIVES_PROXY_ID = "IncentivesProxy";
export const EMISSION_MANAGER_ID = "EmissionManager";
export const INCENTIVES_V2_IMPL_ID = `IncentivesV2-${IMPL_ID}`;
export const INCENTIVES_PULL_REWARDS_STRATEGY_ID = `PullRewardsTransferStrategy`;
export const INCENTIVES_STAKED_TOKEN_STRATEGY_ID = `StakedTokenTransferStrategy`;
export const ORACLE_ID = `AaveOracle-${MARKET_NAME}`;
export const FALLBACK_ORACLE_ID = `FallbackOracle-${MARKET_NAME}`;
// pyth change
export const PYTH_ORACLE_ID = "PythOracle";
export const TREASURY_PROXY_ID = "TreasuryProxy";
export const TREASURY_IMPL_ID = `Treasury-${IMPL_ID}`;
export const TREASURY_CONTROLLER_ID = `Treasury-Controller`;
export const AAVE_COLLECTOR_PROXY_ID = `AaveCollector-${PROXY_ID}-${MARKET_NAME}`;
export const AAVE_COLLECTOR_IMPL_ID = `AaveCollector-${IMPL_ID}-${MARKET_NAME}`;
export const TESTNET_TOKEN_PREFIX = `-TestnetMintableERC20-${MARKET_NAME}`;
export const TESTNET_REWARD_TOKEN_PREFIX = `-TestnetMintableERC20-Reward-${MARKET_NAME}`;
export const TESTNET_PRICE_AGGR_PREFIX = `-TestnetPriceAggregator-${MARKET_NAME}`;
export const ATOKEN_PREFIX = `-AToken-${MARKET_NAME}`;
export const VARIABLE_DEBT_PREFIX = `-VariableDebtToken-${MARKET_NAME}`;
export const STABLE_DEBT_PREFIX = `-StableDebtToken-${MARKET_NAME}`;
export const STAKE_AAVE_PROXY = `StakeAave-${PROXY_ID}`;
export const STAKE_AAVE_IMPL_V1 = `StakeAave-REV-1-${IMPL_ID}`;
export const STAKE_AAVE_IMPL_V2 = `StakeAave-REV-2-${IMPL_ID}`;
export const STAKE_AAVE_IMPL_V3 = `StakeAave-REV-3-${IMPL_ID}`;
export const L2_ENCODER = "L2Encoder";
export const FAUCET_OWNABLE_ID = `Faucet-${MARKET_NAME}`;
