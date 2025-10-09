import { router } from '@server/trpc';
import create from './create';
import remove from './remove';
import isFollowing from './isFollowing';
import totalFollowing from './totalFollowing';
import totalFollowers from './totalFollowers';
import getFollowing from './getFollowing';
import getFollowers from './getFollowers';

export default router({
  follow: create,
  unfollow: remove,
  isFollowing,
  totalFollowing,
  totalFollowers,
  getFollowing,
  getFollowers,
});
