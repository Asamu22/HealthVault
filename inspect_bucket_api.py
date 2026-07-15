from backend.supabase_client import sb
import inspect
import storage3
import storage3._sync.client as c

print('storage3 module', storage3.__file__)
print('update_bucket signature', inspect.signature(sb.storage.update_bucket))
print('SyncStorageClient.update_bucket source:')
print(inspect.getsource(c.SyncStorageClient.update_bucket))
