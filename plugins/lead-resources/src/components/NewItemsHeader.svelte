<!--
// Copyright © 2022 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
-->
<script lang="ts">
  import { Button, showPopup, IconAdd } from '@hcengineering/ui'
  import lead from '../plugin'
  import CreateCustomer from './CreateCustomer.svelte'
  import { AccountRole, getCurrentAccount, hasAccountRole } from '@hcengineering/core'

  async function newIssue (): Promise<void> {
    showPopup(CreateCustomer, {}, 'top')
  }
</script>

{#if hasAccountRole(getCurrentAccount(), AccountRole.User)}
  <div class="antiNav-subheader">
    <Button
      icon={IconAdd}
      label={lead.string.CreateCustomerLabel}
      justify={'left'}
      width={'100%'}
      kind={'primary'}
      gap={'large'}
      on:click={newIssue}
    />
  </div>
{/if}
