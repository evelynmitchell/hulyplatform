import {
  ApiEndpoint,
  generateId,
  getSecondPage,
  IssuesDetailsPage,
  IssuesPage,
  LoginPage,
  NewIssue,
  SelectWorkspacePage,
  TrackerNavigationMenuPage
} from '@hcengineering/tests-sanity'
import { test } from '@playwright/test'
import { AdminPage } from '../model/admin.page'

test.describe('Workspace Migration tests', () => {
  let loginPage: LoginPage
  let selectWorkspacePage: SelectWorkspacePage
  let trackerNavigationMenuPage: TrackerNavigationMenuPage
  let issuesPage: IssuesPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    selectWorkspacePage = new SelectWorkspacePage(page)
    trackerNavigationMenuPage = new TrackerNavigationMenuPage(page)
    issuesPage = new IssuesPage(page)
  })

  test('New workspace migrate to europe', async ({ page, browser, request }) => {
    const api: ApiEndpoint = new ApiEndpoint(request)
    const workspaceInfo = await api.createWorkspaceWithLogin(generateId(), 'user1', '1234')

    const newIssue: NewIssue = {
      title: `Issue with all parameters and attachments-${generateId()}`,
      description: 'Created issue with all parameters and attachments description',
      status: 'In Progress',
      priority: 'Urgent',
      createLabel: true,
      labels: `CREATE-ISSUE-${generateId()}`,
      component: 'No component',
      estimation: '2',
      milestone: 'No Milestone',
      duedate: 'today'
    }
    await test.step('create new workspace', async () => {
      await loginPage.goto()
      await loginPage.login('user1', '1234')

      await selectWorkspacePage.selectWorkspace(workspaceInfo.workspaceName)

      await trackerNavigationMenuPage.openIssuesForProject('Default')
      await issuesPage.clickModelSelectorAll()
      await issuesPage.createNewIssue(newIssue)
      await issuesPage.openIssueByName(newIssue.title)

      const issuesDetailsPage = new IssuesDetailsPage(page)
      await issuesDetailsPage.checkIssue(newIssue)
    })

    using adminSecondPage = await getSecondPage(browser)
    const page2 = adminSecondPage.page

    await test.step('Migrate workspace', async () => {
      // login as admin
      const loginPage2 = new LoginPage(adminSecondPage.page)
      await loginPage2.goto()
      await loginPage2.login('admin', '1234')

      await loginPage2.page.waitForURL((url) => {
        return url.pathname.startsWith('/login/selectWorkspace') || url.pathname.startsWith('/workbench/')
      })

      const adminPage = new AdminPage(page2)
      await adminPage.gotoAdmin()

      await page2.getByText('Today -').click()
      await page2.locator('div:nth-child(3) > .checkbox-container > .checkSVG').click()
      await page2.locator('div:nth-child(4) > .checkbox-container > .checkSVG').click()

      await page2.getByRole('button', { name: 'America', exact: true }).click()
      await page2.getByRole('button', { name: 'europe (hidden)' }).click()
      await page2.getByPlaceholder('Search').click()
      await page2.getByPlaceholder('Search').fill(workspaceInfo.workspaceId)
      await page2.locator(`[id="${workspaceInfo.workspaceId}"]`).getByRole('button', { name: 'Migrate' }).click()

      await page2.getByRole('button', { name: 'Ok' }).click()
      await page2.locator(`[id="${workspaceInfo.workspaceId}"]`).getByText('europe').waitFor()
    })
    await test.step('Check workspace is active again', async () => {
      await page.reload()

      const issuesDetailsPage = new IssuesDetailsPage(page)
      await issuesDetailsPage.checkIssue(newIssue)
    })
  })
})
