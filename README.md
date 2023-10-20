Todo:

- Load progress clocks from (hardcoded for now) serialised data
- Start implementing session-oriented functionality
- Add some kind of regular "sync" to a remote server every few seconds (separate from the animation loop)

https://serde.rs/
You need to enable the serde feature flag on the uuid crate in order for it to provide Serialize and Deserialize impls.
