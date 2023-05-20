export const chains = [
    {
        chainId: 5,
        chainName: "Goerli",
        rpcUrls: [
            "https://goerli.infura.io/v3/${INFURA_API_KEY}",
            "wss://goerli.infura.io/v3/${INFURA_API_KEY}",
            "https://rpc.goerli.mudit.blog/",
            "https://ethereum-goerli.publicnode.com"
        ],
        nativeCurrency: {
            name: "Goerli Ether",
            symbol: "ETH",
            decimals: 18
        },
    },
];