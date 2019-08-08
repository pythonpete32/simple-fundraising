const App = artifacts.require("App")
const DAOFactory = artifacts.require('DAOFactory')
const EVMScriptRegistryFactory = artifacts.require('EVMScriptRegistryFactory')
const ACL = artifacts.require('ACL')
const Kernel = artifacts.require('Kernel')

const {
    deployedContract
} = require("./utils")

contract("App", ([rootAccount, ...accounts]) => {

    let kernelBase, aclBase, evmScriptRegistryFactory, daoFactory
    let appBase, app

    before(async () => {
        kernelBase = await Kernel.new(true)
        aclBase = await ACL.new()
        evmScriptRegistryFactory = await EVMScriptRegistryFactory.new()
        daoFactory = await DAOFactory.new(this.kernelBase.address, this.aclBase.address, this.evmScriptRegistryFactory.address)

        appBase = await App.new()
    })

    beforeEach(async () => {
        const newKernelReceipt = await this.daoFactory.newDAO(this.rootAddress)
        kernel = await Kernel.at(newKernelReceipt.logs.filter(log => log.event === 'DeployDAO')[0].args.dao)
        acl = await ACL.at(await this.kernel.acl())

        const APP_MANAGER_ROLE = await kernelBase.APP_MANAGER_ROLE()
        await acl.createPermission(rootAddress, kernel.address, APP_MANAGER_ROLE, rootAddress, {
            from: rootAddress
        })

        const newAppReceipt = await kernel.newAppInstance('0x1234', appBase.address)
        app = await App.at(deployedContract(newAppReceipt))

        // app.initialize(uint256 _rate, address _wallet, TokenManager _tokenManager, MiniMeToken _token)
    })


})