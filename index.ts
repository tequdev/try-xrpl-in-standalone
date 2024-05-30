import { Client, ECDSA, Wallet, xrpToDrops } from 'xrpl'

const client = new Client('ws://localhost:6006')

/// @ts-ignore
const accept = async () => { await client.request({ command: 'ledger_accept' }) }

const fund = async (address: string, xrpAmount: number = 100) => {
  const genesis = Wallet.fromSeed('snoPBrXtMeMyMHUVTgbuqAfg1SUTb', { algorithm: ECDSA.secp256k1 })
  await client.submit({
    TransactionType: "Payment",
    Account: genesis.address,
    Destination: address,
    Amount: xrpToDrops(xrpAmount),
  }, { wallet: genesis })
  await accept()
}

const main = async () => {
  await client.connect()

  const alice = Wallet.generate()

  await fund(alice.address)

  const bob = Wallet.generate()

  const aliceAccountInfo = await client.request({ command: 'account_info', account: alice.address })
  console.log("Alice Balance: ", aliceAccountInfo.result.account_data.Balance)
  
  console.log("Creating Payment transaction from Alice to Bob")

  await client.submit({
    TransactionType: "Payment",
    Account: alice.address,
    Destination: bob.address,
    Amount: xrpToDrops(10),
  }, { wallet: alice })

  const aliceAccountInfoAfter = await client.request({ command: 'account_info', account: alice.address })
  console.log("Alice Balance After: ", aliceAccountInfoAfter.result.account_data.Balance)
  const bobAccountInfo = await client.request({ command: 'account_info', account: bob.address })
  console.log("Bob Balance: ", bobAccountInfo.result.account_data.Balance)

  await client.disconnect()
}

main()
