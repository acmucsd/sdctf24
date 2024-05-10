import { Group, Stack } from '@mantine/core'
import { FC } from 'react'
import ChallengePanel from '@Components/ChallengePanel'
import GameNoticePanel from '@Components/GameNoticePanel'
import TeamRank from '@Components/TeamRank'
import WithGameTab from '@Components/WithGameTab'
import WithNavBar from '@Components/WithNavbar'
import WithRole from '@Components/WithRole'
import { useIsMobile } from '@Utils/ThemeOverride'
import { Role } from '@Api'

const Challenges: FC = () => {
  const isMobile = useIsMobile(1300)

  return (
    <WithNavBar width="90%">
      <WithRole requiredRole={Role.User}>
        <WithGameTab>
          <Group
            gap="sm"
            justify="space-between"
            align="flex-start"
            wrap={isMobile ? 'wrap' : 'nowrap'}
            style={{ marginBottom: '2rem' }}
          >
            <ChallengePanel />
            <Stack style={{ flexBasis: '20rem', flexGrow: 1 }}>
              <TeamRank />
              <GameNoticePanel />
            </Stack>
          </Group>
        </WithGameTab>
      </WithRole>
    </WithNavBar>
  )
}

export default Challenges
