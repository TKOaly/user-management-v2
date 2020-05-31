import { getMe, searchUsers } from '../services/tkoUserService'
import { AppProps } from '../features/App'

const getUserList = (token: string) =>
  searchUsers('', token)
    .then(({ payload }) => payload)

export const resolveInitialState = async (token: string, path: string): Promise<AppProps> => {
  const me = await getMe(token).then(({ payload }) => payload)
  const userList = me.role !== 'kayttaja' ? await getUserList(token) : []

  return {
    user: me,
    userSearchState: {
      users: userList
    },
    navigation: {
      path
    }
  }
}