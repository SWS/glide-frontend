import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { CollectiblesState } from 'state/types'
import { nftSources } from 'config/constants/nfts'
import { NftType } from 'config/constants/types'
import { shuffleArray } from 'utils/collectibles'
// import { getAddress } from 'utils/addressHelpers'
// import { getErc721Contract } from 'utils/contractHelpers'
// import { getNftByTokenId } from 'utils/collectibles'
// import { ethers } from 'ethers'

const initialState: CollectiblesState = {
  isInitialized: false,
  isLoading: true,
  data: {},
}

// type NftSourceItem = [number, string]

// Thunks
// export const fetchWalletNfts = createAsyncThunk<NftSourceItem[], string>(
export const fetchWalletNfts = createAsyncThunk<any, string>('collectibles/fetchWalletNfts', async (account) => {
  // For each nft source get nft data
  const nftSourcePromises = Object.keys(nftSources).map(async (nftSourceType) => {
    const { creator } = nftSources[nftSourceType as NftType]
    const creatorQuery = await fetch(creator).then((response) => response.json())
    const ownedNfts = creatorQuery.data.filter(
      // (nft) => nft.holder === '0x2aA33f425602c3c0b6313E71A1C0b981efa18142', // 3+
      // (nft) => nft.holder === '0xA52B02C68cB65083788c46F2c08c6935f0aB19C1', // 2
      // (nft) => nft.holder === '0x4b98efA1840e80962733432809Dd5e0ba941EA8C', // 1
      (nft) => nft.holder === account,
    )

    const balanceOf = ownedNfts.length

    if (balanceOf === 0) {
      return []
    }

    return ownedNfts
  })

  const nftSourceData = await Promise.all(nftSourcePromises)
  const randomSorted = shuffleArray(nftSourceData[0])
  return randomSorted.flat()
})

export const collectiblesSlice = createSlice({
  name: 'collectibles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchWalletNfts.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(fetchWalletNfts.fulfilled, (state, action) => {
      state.isLoading = false
      state.isInitialized = true
      state.data = action.payload
    })
  },
})

// const initialState: CollectiblesState = {
//   isInitialized: false,
//   isLoading: true,
//   data: {},
// }

// type NftSourceItem = [number, string]

// // Thunks
// export const fetchWalletNfts = createAsyncThunk<NftSourceItem[], string>(
//   'collectibles/fetchWalletNfts',
//   async (account) => {
//     // For each nft source get nft data
//     const nftSourcePromises = Object.keys(nftSources).map(async (nftSourceType) => {
//       const { address: addressObj } = nftSources[nftSourceType as NftType]
//       const address = getAddress(addressObj)
//       const contract = getErc721Contract(address)

//       const getTokenIdAndData = async (index: number) => {
//         try {
//           const tokenIdBn: ethers.BigNumber = await contract.tokenOfOwnerByIndex(account, index)
//           const tokenId = tokenIdBn.toNumber()

//           const walletNft = await getNftByTokenId(address, tokenId)
//           return [tokenId, walletNft.identifier]
//         } catch (error) {
//           console.error('getTokenIdAndData', error)
//           return null
//         }
//       }

//       const balanceOfResponse = await contract.balanceOf(account)
//       const balanceOf = balanceOfResponse.toNumber()

//       if (balanceOf === 0) {
//         return []
//       }

//       const nftDataFetchPromises = []

//       // For each index get the tokenId and data associated with it
//       for (let i = 0; i < balanceOf; i++) {
//         nftDataFetchPromises.push(getTokenIdAndData(i))
//       }

//       const nftData = await Promise.all(nftDataFetchPromises)
//       return nftData
//     })

//     const nftSourceData = await Promise.all(nftSourcePromises)

//     return nftSourceData.flat()
//   },
// )

// export const collectiblesSlice = createSlice({
//   name: 'collectibles',
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder.addCase(fetchWalletNfts.pending, (state) => {
//       state.isLoading = true
//     })
//     builder.addCase(fetchWalletNfts.fulfilled, (state, action) => {
//       state.isLoading = false
//       state.isInitialized = true
//       state.data = action.payload.reduce((accum, association) => {
//         if (!association) {
//           return accum
//         }

//         const [tokenId, identifier] = association as NftSourceItem

//         return {
//           ...accum,
//           [identifier]: accum[identifier] ? [...accum[identifier], tokenId] : [tokenId],
//         }
//       }, {})
//     })
//   },
// })

export default collectiblesSlice.reducer
