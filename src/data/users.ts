export const PASSWORD = "test_sauce";

export const USERS = {
  shopper:   { username: "fern_signal", shouldLogin: true,  label: "Shopper" },
  locked:    { username: "quiet_lock",  shouldLogin: false, label: "Locked account" },
  image:     { username: "lens_warp",   shouldLogin: true,  label: "Image variation" },
  cartBadge: { username: "count_echo",  shouldLogin: true,  label: "Cart badge" },
} as const;

export const ALL_USERS = Object.values(USERS);
export const LOGGABLE_USERS = ALL_USERS.filter((u) => u.shouldLogin);

export const LOCKED_MESSAGE = "Sorry, this user has been locked out.";
