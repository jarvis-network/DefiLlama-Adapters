const { sumTokens2 } = require('../helper/unwrapLPs');
const { getLogs } = require('../helper/cache/getLogs')

const ignored = ["0xC011A72400E58ecD99Ee497CF89E3775d4bd732F", "0x57Ab1E02fEE23774580C119740129eAC7081e9D3", // old synthetix
  //self destructed
  "0x00f109f744B5C918b13d4e6a834887Eb7d651535", "0x645F7dd67479663EE7a42feFEC2E55A857cb1833", "0x4922a015c4407F87432B179bb209e125432E4a2A",
  "0xdA16D6F08F20249376d01a09FEBbAd395a246b2C", "0x9be4f6a2558f88A82b46947e3703528919CE6414", "0xa7fd7d83e2d63f093b71c5f3b84c27cff66a7802",
  "0xacfbe6979d58b55a681875fc9adad0da4a37a51b", "0xd6d9bc8e2b894b5c73833947abdb5031cc7a4894",

  // pool tokens
  "0x05f21bacc4fd8590d1eaca9830a64b66a733316c", "0x089443665084fc50aa6f1d0dc0307333fd481b85", "0x02d2e2d7a89d6c5cb3681cfcb6f7dac02a55eda4",
  "0xfb5e6d0c1dfed2ba000fbc040ab8df3615ac329c",
  "0xa13a9247ea42d743238089903570127dda72fe44", // eth bb-a-USD
]

const V2_ADDRESS = '0xBA12222222228d8Ba445958a75a0704d566BF2C8'; // shared by all networks

const config = {
  ethereum: { fromBlock: 12272146, },
  polygon: { fromBlock: 15832990, },
  arbitrum: { fromBlock: 222832, },
  optimism: { fromBlock: 7003431, },
  xdai: { fromBlock: 24821598, },
}

module.exports = {};

Object.keys(config).forEach(chain => {
  const { fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const logs = await getLogs({
        api,
        target: V2_ADDRESS,
        topics: ['0x3c13bc30b8e878c53fd2a36b679409c073afd75950be43d8858768e956fbc20e'],
        fromBlock,
        eventAbi: 'event PoolRegistered(bytes32 indexed poolId, address indexed poolAddress, uint8 specialization)',
        onlyArgs: true,
        extraKey: 'PoolRegistered',
      })
      const logs2 = await getLogs({
        api,
        target: V2_ADDRESS,
        topics: ['0xf5847d3f2197b16cdcd2098ec95d0905cd1abdaf415f07bb7cef2bba8ac5dec4'],
        fromBlock,
        eventAbi: 'event TokensRegistered(bytes32 indexed poolId, address[] tokens, address[] assetManagers)',
        onlyArgs: true,
        extraKey: 'TokensRegistered',
      })

      const tokens = logs2.map(i => i.tokens).flat()
      const pools = logs.map(i => i.poolAddress)
      const blacklistedTokens = [...ignored, ...pools]

      return sumTokens2({ api, owner: V2_ADDRESS, tokens, blacklistedTokens, })
    }
  }
})
