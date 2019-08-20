const App = artifacts.require("App");
const DAOFactory = artifacts.require("DAOFactory");
const EVMScriptRegistryFactory = artifacts.require("EVMScriptRegistryFactory");
const ACL = artifacts.require("ACL");
const Kernel = artifacts.require("Kernel");
const TokenManager = artifacts.require("TokenManager");
const MiniMeTokenFactory = artifacts.require("MiniMeTokenFactory");

const { deployedContract } = require("./utils");

contract("App", ([rootAccount, ...accounts]) => {
  let kernelBase, aclBase, evmScriptRegistryFactory, daoFactory;
  let appBase, tokenManagerBase;
  let tokenManager, MiniMeTokenFactory, token, app;

  // before we create the app bases for the proxies to point
  before(async () => {
    kernelBase = await Kernel.new(true);
    aclBase = await ACL.new();
    evmScriptRegistryFactory = await EVMScriptRegistryFactory.new();
    daoFactory = await DAOFactory.new(
      kernelBase.address,
      aclBase.address,
      evmScriptRegistryFactory.address
    );

    tokenManagerBase = await TokenManager.new();
    appBase = await App.new();
  });

  beforeEach(async () => {
    const newKernelReceipt = await daoFactory.newDAO(rootAccount); // <-- this launches a dew dao and saves the tx in newKernelReceipt ? what is the root address? is it the first address the web3 object returns?
    kernel = await Kernel.at(
      newKernelReceipt.logs.filter(log => log.event === "DeployDAO")[0].args.dao
    ); // kernel == DAO instance
    acl = await ACL.at(await kernel.acl()); // <-- gets reference to the DAO acl ?

    const APP_MANAGER_ROLE = await kernelBase.APP_MANAGER_ROLE();
    await acl.createPermission(
      rootAccount,
      kernel.address,
      APP_MANAGER_ROLE,
      rootAccount,
      {
        from: rootAccount
      }
    ); // <- changes the app manager role to root address and sends the tx from the root address?

    const newAppReceipt = await kernel.newAppInstance(
      "0x1234",
      appBase.address
    );
    app = await App.at(deployedContract(newAppReceipt));

    // setup token
    // tokenFactory = await MiniMeTokenFactory.new();
    // token = await tokenFactory.createCloneToken(
    //   MiniMeToken(0),
    //   0,
    //   "Testing Token",
    //   18,
    //   "TST",
    //   true
    // );
    // await token.generateTokens(address(rootAccount), 100); // give root 100 tokens

    // setup TokenManager
    // const newTokenManagerReceipt = await kernel.newAppInstance(
    //   "0x4567",
    //   tokenManagerBase.address
    // );
    // tokenManager = await TokenManager.at(
    //   deployedContract(newTokenManagerReceipt)
    // );

    // await token.changeController(tokenManager);

    // initialize apps
    // await app.initialize(1, rootAccount, tokenManager, accounts[0]);
    // await tokenManager.initialize(token, true, 0);

    // permissions
    // await acl.createPermission(
    //   ANY_ENTITY,
    //   tokenManager,
    //   tokenManager.MINT_ROLE(),
    //   app
    // );
    // await acl.createPermission(
    //   ANY_ENTITY,
    //   tokenManager,
    //   tokenManager.ISSUE_ROLE(),
    //   rootAccount
    // );
    // await acl.createPermission(
    //   ANY_ENTITY,
    //   tokenManager,
    //   tokenManager.ASSIGN_ROLE(),
    //   rootAccount
    // );
    // await acl.createPermission(
    //   ANY_ENTITY,
    //   tokenManager,
    //   tokenManager.REVOKE_VESTINGS_ROLE(),
    //   rootAccount
    // );

    // await acl.createPermission(
    //   ANY_ENTITY,
    //   app,
    //   tokenManager.SET_WALLET_ADDRESS_ROLE(),
    //   rootAccount
    // );
    // await acl.createPermission(
    //   ANY_ENTITY,
    //   app,
    //   tokenManager.SET_RATE_ROLE(),
    //   rootAccount
    // );
  });

  //---------------- tests --------------------//

  describe("initialize(uint256 _rate, address _wallet, TokenManager _tokenManager, MiniMeToken _token)", () => {
    it("should set variables as expected", async () => {
      // Arrange
      const expectedRate = 5;
      const expectedWallet = accounts[0];
      const expectedTokenManager = accounts[1];
      const expectedToken = accounts[2];

      // Act
      await app.initialize(
        expectedRate,
        expectedWallet,
        expectedTokenManager,
        expectedToken
      );

      // Assert
      actualRate = await app.rate();
      actualWallet = await app.wallet();
      actualTokenManager = await app.tokenManager();
      actualToken = await app.token();

      assert.equal(actualRate, expectedRate);
      assert.equal(actualWallet, expectedWallet);
      assert.equal(actualTokenManager, expectedTokenManager);
      assert.equal(actualToken, expectedToken);
    });
  });

  describe("buyTokens()", () => {
    // <-- buy tokens with what account
    it("should send tokens to the msg.sender", async () => {});
  });
});
