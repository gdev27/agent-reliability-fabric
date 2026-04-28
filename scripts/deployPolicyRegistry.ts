import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  const [deployer] = await ethers.getSigners();
  const admin = process.env.ADMIN_ADDRESS || deployer.address;
  const policyAdmin = process.env.POLICY_ADMIN_ADDRESS || deployer.address;
  const guardian = process.env.GUARDIAN_ADDRESS || deployer.address;

  const Factory = await ethers.getContractFactory("PolicyRegistry");
  const registry = (await Factory.deploy(admin, policyAdmin, guardian)) as unknown as {
    waitForDeployment: () => Promise<unknown>;
    getAddress: () => Promise<string>;
    deploymentTransaction: () =>
      | {
          hash: string;
          wait: () => Promise<{ blockNumber?: number } | null>;
        }
      | null;
  };
  await registry.waitForDeployment();
  const address = await registry.getAddress();
  const deploymentTx = registry.deploymentTransaction();
  const receipt = deploymentTx ? await deploymentTx.wait() : null;

  console.log(
    JSON.stringify(
      {
        address,
        deployTxHash: deploymentTx?.hash || null,
        deployBlockNumber: receipt?.blockNumber || null,
        deployer: deployer.address,
        admin,
        policyAdmin,
        guardian
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
