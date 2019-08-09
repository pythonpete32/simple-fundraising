const App = artifacts.require("App")
const DAOFactory = artifacts.require('DAOFactory')
const EVMScriptRegistryFactory = artifacts.require('EVMScriptRegistryFactory')
const ACL = artifacts.require('ACL')
const Kernel = artifacts.require('Kernel')
const TokenManager = artifacts.require('TokenManager')
const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory')

const {
    deployedContract
} = require("./utils")

contract("App", ([rootAccount, ...accounts]) => {

    let kernelBase, aclBase, evmScriptRegistryFactory, daoFactory
    let appBase, tokenManagerBase
    let TokenManager, MiniMeTokenFactory, token, app

    // before we create the app bases for the proxies to point
    before(async () => {
        kernelBase = await Kernel.new(true)
        aclBase = await ACL.new()
        evmScriptRegistryFactory = await EVMScriptRegistryFactory.new()
        daoFactory = await DAOFactory.new(this.kernelBase.address, this.aclBase.address, this.evmScriptRegistryFactory.address)

        tokenManagerBase = await TokenManager.new()
        appBase = await App.new()
    })

    beforeEach(async () => {

        const newKernelReceipt = await this.daoFactory.newDAO(this.rootAddress)
        kernel = await Kernel.at(newKernelReceipt.logs.filter(log => log.event === 'DeployDAO')[0].args.dao) // kernel == DAO instance
        acl = await ACL.at(await this.kernel.acl())

        const APP_MANAGER_ROLE = await kernelBase.APP_MANAGER_ROLE()
        await acl.createPermission(rootAddress, kernel.address, APP_MANAGER_ROLE, rootAddress, {
            from: rootAddress
        })

        const newAppReceipt = await kernel.newAppInstance('0x1234', appBase.address)
        app = await App.at(deployedContract(newAppReceipt))

        // setup token
        tokenFactory = new MiniMeTokenFactory();
        token = tokenFactory.createCloneToken(MiniMeToken(0), 0, "Testing Token", 18, "TST", true)
        token.generateTokens(address(root), 100); // give root 100 tokens

        // setup TokenManager
        tokenManagerID = apmNamehash("token-manager")
        tokenManager = TokenManager(kernel.newAppInstance(tokenManagerID, tokenManagerBase)) // <-- is this correct
        token.changeController(tokenManager);

        // initialize apps 
        app.initialize(1, this.rootAddress, tokenManager, token) // <-- root address is message.sender?
        tokenManager.initialize(token, true, 0);

        // permissions
        acl.createPermission(ANY_ENTITY, tokenManager, tokenManager.MINT_ROLE(), app);
        acl.createPermission(ANY_ENTITY, tokenManager, tokenManager.ISSUE_ROLE(), this.rootAddress);
        acl.createPermission(ANY_ENTITY, tokenManager, tokenManager.ASSIGN_ROLE(), this.rootAddress);
        acl.createPermission(ANY_ENTITY, tokenManager, tokenManager.REVOKE_VESTINGS_ROLE(), this.rootAddress);

        acl.createPermission(ANY_ENTITY, app, tokenManager.SET_WALLET_ADDRESS_ROLE(), this.rootAddress);
        acl.createPermission(ANY_ENTITY, app, tokenManager.SET_RATE_ROLE(), this.rootAddress);
    })


})