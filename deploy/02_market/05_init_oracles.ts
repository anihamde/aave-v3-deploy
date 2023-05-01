import {
  getSubTokensByPrefix,
  isIncentivesEnabled,
} from "../../helpers/market-config-helpers";
import {
  FALLBACK_ORACLE_ID,
  ORACLE_ID,
  TESTNET_REWARD_TOKEN_PREFIX,
  TESTNET_PRICE_AGGR_PREFIX,
} from "../../helpers/deploy-ids";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
  MOCK_ORACLES_PRICES,
  V3_CORE_VERSION,
} from "../../helpers/constants";
import { getContract, waitForTx } from "../../helpers/utilities/tx";
import {
  AaveOracle,
  PoolAddressesProvider,
  PriceOracle__factory,
} from "../../typechain";
import { POOL_ADDRESSES_PROVIDER_ID } from "../../helpers/deploy-ids";
import { getAddress } from "@ethersproject/address";
import {
  checkRequiredEnvironment,
  ConfigNames,
  getReserveAddresses,
  isProductionMarket,
  loadPoolConfig,
} from "../../helpers/market-config-helpers";
import { eNetwork } from "../../helpers/types";
import Bluebird from "bluebird";
import { MARKET_NAME } from "../../helpers/env";

const func: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
  ...hre
}: HardhatRuntimeEnvironment) {
  const { deployer } = await getNamedAccounts();
  const addressesProviderArtifact = await deployments.get(
    POOL_ADDRESSES_PROVIDER_ID
  );
  const addressesProviderInstance = (
    await hre.ethers.getContractAt(
      addressesProviderArtifact.abi,
      addressesProviderArtifact.address
    )
  ).connect(await hre.ethers.getSigner(deployer)) as PoolAddressesProvider;

  // 1. Set price oracle
  const configPriceOracle = (await deployments.get(ORACLE_ID)).address;
  const statePriceOracle = await addressesProviderInstance.getPriceOracle();
  if (getAddress(configPriceOracle) === getAddress(statePriceOracle)) {
    console.log("[addresses-provider] Price oracle already set. Skipping tx.");
  } else {
    await waitForTx(
      await addressesProviderInstance.setPriceOracle(configPriceOracle)
    );
    console.log(
      `[Deployment] Added PriceOracle ${configPriceOracle} to PoolAddressesProvider`
    );
  }

  // pyth change
  // 2. set fallback oracle
  const aaveOracle = await getContract("AaveOracle", statePriceOracle);
  const { address: configFallbackOracle} = (await deployments.get(FALLBACK_ORACLE_ID));
  const stateFallbackOracle = await aaveOracle.getFallbackOracle();
  if (getAddress(configFallbackOracle) === getAddress(stateFallbackOracle)) {
    console.log("[aave-oracle] Fallback oracle already set. Skipping tx.");
  } else {
    await waitForTx(await aaveOracle.setFallbackOracle(configFallbackOracle));
    console.log(`[Deployment] Added Fallback oracle ${configFallbackOracle} to AaveOracle`);
  }
  // 3. For each source, update mock Pyth price to mirror aggregator price
  const poolConfig = loadPoolConfig(MARKET_NAME);
  const network = (process.env.FORK ? process.env.FORK : hre.network.name) as eNetwork;
  const reserves = (await getReserveAddresses(poolConfig, network));
  let symbols = Object.keys(reserves);
  for (const symbol of symbols) {
    const price = symbol === "StkAave"
      ? MOCK_ORACLES_PRICES["AAVE"]
      : MOCK_ORACLES_PRICES[symbol];
    if (!price) {
      throw `[ERROR] Misisng mock price for asset ${symbol} at MOCK_ORACLES_PRICES constant located at src/constants.ts`
    }
    const { address: source } = (await deployments.get(
      `${symbol}${TESTNET_PRICE_AGGR_PREFIX}`
    ));
    await aaveOracle.updateWithPriceFeedUpdateData(source, price, 1, 0, price, 1, 1_600_000_000_000);
  }

  // 4. If testnet, setup fallback token prices
  if (isProductionMarket(poolConfig)) {
    console.log("[Deployment] Skipping testnet token prices setup");
    // Early exit if is not a testnet market
    return true;
  } else {
    console.log("[Deployment] Setting up fallback oracle default prices for testnet environment");
    const reserves = await getReserveAddresses(poolConfig, network);
    const rewards = isIncentivesEnabled(poolConfig)
      ? await getSubTokensByPrefix(TESTNET_REWARD_TOKEN_PREFIX)
      : [];
    const rewardsSymbols = rewards.map(({ symbol }) => symbol);
    const symbols = [...Object.keys(reserves), ...rewardsSymbols];
    const allTokens = {
      ...reserves,
    };
    rewards.forEach(({ symbol, artifact: { address } }) => {
      allTokens[symbol] = address;
    });
    // Iterate each token symbol and deploy a mock aggregator
    await Bluebird.each(symbols, async (symbol) => {
      const price =
        symbol === "StkAave"
          ? MOCK_ORACLES_PRICES["AAVE"]
          : MOCK_ORACLES_PRICES[symbol];

      if (!price) {
        throw `[ERROR] Missing mock price for asset ${symbol} at MOCK_ORACLES_PRICES constant located at src/constants.ts`;
      }
      await waitForTx(
        await PriceOracle__factory.connect(
          configFallbackOracle,
          await hre.ethers.getSigner(deployer)
        ).setAssetPrice(allTokens[symbol], price)
      );
    });
    console.log("[Deployment] Fallback oracle asset prices updated");
    return true
  }
};

// This script can only be run successfully once per market, core version, and network
func.id = `InitOracles:${MARKET_NAME}:aave-v3-core@${V3_CORE_VERSION}`;

func.tags = ["market", "oracles"];

func.dependencies = ["before-deploy", "core", "periphery-pre", "provider"];

func.skip = async () => checkRequiredEnvironment();

export default func;
