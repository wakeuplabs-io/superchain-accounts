import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const BASE_URI = 'https://superchain-badges.s3.amazonaws.com/NFT/metadata';
const API_URL = process.env.API_URL || 'https://superchain.wakeuplabs.link';

// Badge configuration mapping tokenId to filename
const BADGE_CONFIGS = {
  // Base badges (chainId: 84532)
  'base': {
    chainId: '84532',
    badges: {
      1: 'base-days-25.json',
      2: 'base-days-50.json',
      3: 'base-days-100.json',
      4: 'base-defi-25.json',
      5: 'base-defi-50.json',
      6: 'base-defi-100.json',
    }
  },
  // Optimism badges (chainId: 11155420)
  'optimism': {
    chainId: '11155420',
    badges: {
      1: 'optimism-days-25.json',
      2: 'optimism-days-50.json',
      3: 'optimism-days-100.json',
      4: 'optimism-defi-25.json',
      5: 'optimism-defi-50.json',
      6: 'optimism-defi-100.json',
    }
  },
  // Superchain badges
  'superchain': {
    chainId: '11155420', // Assuming superchain badges are on Optimism
    badges: {
      7: 'superchain-days-25.json',
      8: 'superchain-days-50.json',
      9: 'superchain-days-100.json',
      10: 'superchain-defi-25.json',
      11: 'superchain-defi-50.json',
      12: 'superchain-defi-100.json',
    }
  },
  // Unichain badges (chainId: 1301)
  'unichain': {
    chainId: '1301',
    badges: {
      1: 'unichain-days-25.json',
      2: 'unichain-days-50.json',
      3: 'unichain-days-100.json',
      4: 'unichain-defi-25.json',
      5: 'unichain-defi-50.json',
      6: 'unichain-defi-100.json',
    }
  }
};

async function setBadgeURI(chainId: string, tokenId: number, filename: string) {
  const uri = `${BASE_URI}/${filename}`;
  
  if (!process.env.CRONJOB_KEY) {
    throw new Error('CRONJOB_KEY environment variable is not set');
  }

  try {
    const response = await axios.post(`${API_URL}/badges/uri`, {
      chainId,
      tokenId: tokenId.toString(),
      uri
    }, {
      headers: {
        'x-cron-key': process.env.CRONJOB_KEY
      }
    });

    console.log(`✅ Set URI for badge ${tokenId} on chain ${chainId} to ${uri}`);
    console.log(`   Transaction hash: ${response.data.data.transactionHash}`);
    
    // Add delay to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to set URI for badge ${tokenId} on chain ${chainId}:`);
    console.error(error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  console.log(`Using API URL: ${API_URL}`);
  
  for (const [network, config] of Object.entries(BADGE_CONFIGS)) {
    console.log(`\n🔄 Processing ${network} badges...`);
    
    for (const [tokenId, filename] of Object.entries(config.badges)) {
      try {
        await setBadgeURI(config.chainId, parseInt(tokenId), filename);
      } catch (error) {
        console.error(`Failed to process ${network} badge ${tokenId}`);
        // Continue with next badge even if one fails
        continue;
      }
    }
  }
}

// Execute if running directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}