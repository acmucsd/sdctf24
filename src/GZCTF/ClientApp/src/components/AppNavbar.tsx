import {
  ActionIcon,
  AppShell,
  Avatar,
  Center,
  Menu,
  MenuDivider,
  Stack,
  Tooltip,
  alpha,
  darken,
  useMantineColorScheme,
} from '@mantine/core'
import { createStyles, getStylesRef } from '@mantine/emotion'
import {
  mdiAccountCircleOutline,
  mdiAccountGroupOutline,
  mdiBullhornOutline,
  mdiCached,
  mdiFlagOutline,
  mdiHomeVariantOutline,
  mdiInformationOutline,
  mdiLogin,
  mdiLogout,
  mdiNoteTextOutline,
  mdiPalette,
  mdiTranslate,
  mdiWeatherNight,
  mdiWeatherSunny,
  mdiWrenchOutline,
} from '@mdi/js'
import { Icon } from '@mdi/react'
import React, { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AppControlProps } from '@Components/WithNavbar'
import MainIcon from '@Components/icon/MainIcon'
import { LanguageMap, SupportedLanguages, useLanguage } from '@Utils/I18n'
import { clearLocalCache } from '@Utils/useConfig'
import { useLogOut, useUser } from '@Utils/useUser'
import { Role } from '@Api'

const useStyles = createStyles((theme, _, u) => {
  const active = { ref: getStylesRef('activeItem') } as const

  return {
    active,
    link: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.md,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.colors.gray[1],
      cursor: 'pointer',

      '&:hover': {
        backgroundColor: theme.colors.gray[6] + '80',
      },

      [`&.${active.ref}, &.${active.ref}:hover`]: {
        backgroundColor: alpha(theme.colors[theme.primaryColor][7], 0.25),
        color: theme.colors[theme.primaryColor][4],
      },
    },

    navbar: {
      backgroundColor: theme.colors.gray[8],
      padding: theme.spacing.xs,
      border: 'none',

      [u.smallerThan('xs')]: {
        display: 'none',
      },
    },

    tooltip: {
      marginLeft: 20,
      fontWeight: 500,

      [u.dark]: {
        backgroundColor: darken(theme.colors[theme.primaryColor][8], 0.45),
        color: theme.colors[theme.primaryColor][4],
      },

      [u.light]: {
        backgroundColor: theme.colors[theme.primaryColor][6],
        color: theme.colors.light[0],
      },
    },
  }
})

interface NavbarItem {
  icon: string
  label: string
  link: string
  admin?: boolean
}

export interface NavbarLinkProps {
  icon: string
  label: string
  link?: string
  onClick?: () => void
  isActive?: boolean
}

const NavbarLink: FC<NavbarLinkProps> = (props: NavbarLinkProps) => {
  const { classes, cx } = useStyles()
  const { t } = useTranslation()

  return (
    <Tooltip label={t(props.label)} classNames={classes} position="right">
      <ActionIcon
        onClick={props.onClick}
        component={Link}
        to={props.link ?? '#'}
        className={cx(classes.link, { [classes.active]: props.isActive })}
      >
        <Icon path={props.icon} size={1} />
      </ActionIcon>
    </Tooltip>
  )
}

const AppNavbar: FC<AppControlProps> = ({ openColorModal }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { classes, theme } = useStyles()
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()

  const logout = useLogOut()
  const { user, error } = useUser()
  const { t } = useTranslation()
  const { setLanguage, supportedLanguages } = useLanguage()

  const items: NavbarItem[] = [
    { icon: mdiHomeVariantOutline, label: 'common.tab.home', link: '/' },
    { icon: mdiBullhornOutline, label: 'common.tab.post', link: '/posts' },
    { icon: mdiFlagOutline, label: 'common.tab.game', link: '/games' },
    { icon: mdiAccountGroupOutline, label: 'common.tab.team', link: '/teams' },
    // { icon: mdiInformationOutline, label: 'common.tab.about', link: '/about' },
    { icon: mdiWrenchOutline, label: 'common.tab.admin', link: '/admin/games', admin: true },
  ]

  const getLabel = (path: string) =>
    items.find((item) =>
      item.link === '/'
        ? path === '/'
        : item.link.startsWith('/admin')
          ? path.startsWith('/admin')
          : path.startsWith(item.link)
    )?.label

  const [active, setActive] = useState(getLabel(location.pathname) ?? '')

  useEffect(() => {
    if (location.pathname === '/') {
      setActive(items[0].label)
    } else {
      setActive(getLabel(location.pathname) ?? '')
    }
  }, [location.pathname])

  const links = items
    .filter((m) => !m.admin || user?.role === Role.Admin)
    .map((link) => <NavbarLink {...link} key={link.label} isActive={link.label === active} />)

  const loggedIn = user && !error

  return (
    <AppShell.Navbar className={classes.navbar}>
      {/* Logo */}
      <AppShell.Section grow>
        <Center>
          <MainIcon
            style={{ width: '100%', height: 'auto', position: 'relative', left: 2 }}
            ignoreTheme
            onClick={() => navigate('/')}
          />
        </Center>
      </AppShell.Section>

      {/* Common Nav */}
      <AppShell.Section
        grow
        display="flex"
        style={{
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: theme.spacing.sm,
        }}
      >
        {links}
      </AppShell.Section>

      <AppShell.Section
        grow
        display="flex"
        style={{ flexDirection: 'column', justifyContent: 'end' }}
      >
        <Stack w="100%" align="center" justify="center" gap={5}>
          {/* Language */}
          <Menu position="right-end" offset={24} width={160}>
            <Menu.Target>
              <ActionIcon className={classes.link}>
                <Icon path={mdiTranslate} size={1} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              {supportedLanguages.map((lang: SupportedLanguages) => (
                <Menu.Item key={lang} fw={500} onClick={() => setLanguage(lang)}>
                  {LanguageMap[lang] ?? lang}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>

          {/* Color Mode */}
          <Tooltip
            label={t('common.tab.theme.switch_to', {
              theme:
                colorScheme === 'dark' ? t('common.tab.theme.light') : t('common.tab.theme.dark'),
            })}
            classNames={classes}
            position="right"
          >
            <ActionIcon onClick={() => toggleColorScheme()} className={classes.link}>
              {colorScheme === 'dark' ? (
                <Icon path={mdiWeatherSunny} size={1} />
              ) : (
                <Icon path={mdiWeatherNight} size={1} />
              )}
            </ActionIcon>
          </Tooltip>

          {/* User Info */}
          <Menu position="right-end" offset={24}>
            <Menu.Target>
              <ActionIcon className={classes.link}>
                {user?.avatar ? (
                  <Avatar alt="avatar" src={user?.avatar} radius="md" size="md">
                    {user.userName?.slice(0, 1) ?? 'U'}
                  </Avatar>
                ) : (
                  <Icon path={mdiAccountCircleOutline} size={1} />
                )}
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {loggedIn && (
                <>
                  <Menu.Label>{user?.userName}</Menu.Label>
                  <Menu.Item
                    component={Link}
                    to="/account/profile"
                    leftSection={<Icon path={mdiAccountCircleOutline} size={1} />}
                  >
                    {t('common.tab.account.profile')}
                  </Menu.Item>
                </>
              )}
              <Menu.Item onClick={clearLocalCache} leftSection={<Icon path={mdiCached} size={1} />}>
                {t('common.tab.account.clean_cache')}
              </Menu.Item>
              <Menu.Item onClick={openColorModal} leftSection={<Icon path={mdiPalette} size={1} />}>
                {t('common.content.color.title')}
              </Menu.Item>
              <MenuDivider />
              {loggedIn ? (
                <Menu.Item
                  color="red"
                  onClick={logout}
                  leftSection={<Icon path={mdiLogout} size={1} />}
                >
                  {t('common.tab.account.logout')}
                </Menu.Item>
              ) : (
                <Menu.Item
                  component={Link}
                  to={`/account/login?from=${location.pathname}`}
                  leftSection={<Icon path={mdiLogin} size={1} />}
                >
                  {t('common.tab.account.login')}
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </Stack>
      </AppShell.Section>
    </AppShell.Navbar>
  )
}

export default AppNavbar
