export default type => (payload = {}, meta) =>
    ({ ...(payload instanceof Error ? { error: true } : {}), type, payload, meta });
