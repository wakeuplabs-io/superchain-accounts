import { useWalletConnect } from "@/hooks/use-wallet-connect";
import { getWalletKit } from "@/lib/wallet-connect";
import { getSdkError } from "@walletconnect/utils";

export function SessionDetails() {
  const { activeSessions } = useWalletConnect();
  const walletkit = getWalletKit();

  if (Object.keys(activeSessions).length === 0) {
    return (
      <div className='text-center py-12 bg-white rounded-lg shadow-md'>
        <p className='text-gray-600'>No active sessions</p>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow-md p-4'>
      <h2 className='text-xl font-semibold mb-4'>Active Sessions</h2>
      <div className='grid grid-cols-1 gap-4'>
        {Object.values(activeSessions).map((session) => (
          <div
            key={session.peer?.publicKey}
            className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
          >
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='font-medium text-gray-900'>
                  {session.peer?.metadata?.name || "Unknown App"}
                </h3>
                <p className='text-sm text-gray-500 mt-1'>
                  {session.peer?.metadata?.url || "No URL provided"}
                </p>
              </div>
              <button
                className='text-red-600 hover:text-red-700 px-4 py-2 rounded-md border border-red-200 hover:bg-red-50 transition-colors'
                onClick={() => {
                  walletkit?.disconnectSession({
                    topic: session.topic,
                    reason: getSdkError("USER_DISCONNECTED"),
                  });
                }}
              >
                Disconnect
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}