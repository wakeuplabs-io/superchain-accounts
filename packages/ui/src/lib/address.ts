export function shortenAddress(address: string): string {
  if(address.length < 16) return address;

  return `${address.slice(0, 12)}...${address.slice(-4)}`;
}