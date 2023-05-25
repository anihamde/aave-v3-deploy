import { getChainlinkOracles, getPythOracle } from "../../helpers/market-config-helpers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { COMMON_DEPLOY_PARAMS } from "../../helpers/env";
import { V3_CORE_VERSION, ZERO_ADDRESS } from "../../helpers/constants";
import {
  FALLBACK_ORACLE_ID,
  ORACLE_ID,
  POOL_ADDRESSES_PROVIDER_ID,
  // pyth change
  PYTH_ORACLE_ID
} from "../../helpers/deploy-ids";
import {
  loadPoolConfig,
  ConfigNames,
  getParamPerNetwork,
  checkRequiredEnvironment,
  getReserveAddresses,
} from "../../helpers/market-config-helpers";
import { eNetwork, ICommonConfiguration, SymbolMap } from "../../helpers/types";
import { getPairsTokenAggregator } from "../../helpers/init-helpers";
import { parseUnits } from "ethers/lib/utils";
import { MARKET_NAME } from "../../helpers/env";
import Web3 from "web3";

const func: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
  ...hre
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const poolConfig = await loadPoolConfig(MARKET_NAME as ConfigNames);
  const network = (
    process.env.FORK ? process.env.FORK : hre.network.name
  ) as eNetwork;

  const { OracleQuoteUnit } = poolConfig as ICommonConfiguration;

  const { address: addressesProviderAddress } = await deployments.get(
    POOL_ADDRESSES_PROVIDER_ID
  );

  const fallbackOracleAddress =
    (await getParamPerNetwork(poolConfig.FallbackOracle, network)) ||
    ZERO_ADDRESS;

  const reserveAssets = await getReserveAddresses(poolConfig, network);
  const chainlinkAggregators = await getChainlinkOracles(poolConfig, network);

  // pyth change
  const oracleMinFreshness = 100_000_000_000_000;
  await deploy(PYTH_ORACLE_ID, {
    from: deployer,
    args: [
      oracleMinFreshness,
      0
    ],
    ...COMMON_DEPLOY_PARAMS,
    contract: "MockPyth"
  });
  const pythContract = (await getPythOracle(poolConfig, network));

  const [assets, sourcesAddresses] = getPairsTokenAggregator(
    reserveAssets,
    chainlinkAggregators
  );
  // convert to bytes32
  const sources = [];
  var web3 = new Web3(Web3.givenProvider);
  for(let i = 0; i < sourcesAddresses.length; i++) {
    sources.push("0x" + web3.utils.padLeft(sourcesAddresses[i].replace("0x", ""), 64));
  }

  // Deploy AaveOracle
  await deploy(ORACLE_ID, {
    from: deployer,
    args: [
      addressesProviderAddress,
      assets,
      sources,
      fallbackOracleAddress,
      ZERO_ADDRESS,
      parseUnits("1", OracleQuoteUnit),
      // pyth change
      pythContract,
      oracleMinFreshness
    ],
    ...COMMON_DEPLOY_PARAMS,
    contract: "AaveOracle",
  });

  // Deploy FallbackOracle
  await deploy(FALLBACK_ORACLE_ID, {
    from: deployer,
    args: [],
    ...COMMON_DEPLOY_PARAMS,
    contract: "PriceOracle",
  });
  return true;
};

func.id = `Oracles:${MARKET_NAME}:aave-v3-core@${V3_CORE_VERSION}`;

func.tags = ["market", "oracle"];

func.dependencies = ["before-deploy"];

func.skip = async () => checkRequiredEnvironment();

export default func;
