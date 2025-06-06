<!--
// Copyright © 2023 Hardcore Engineering Inc.
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
  import { PersonAccount } from '@hcengineering/contact'
  import { AccountRole, Doc, Ref, getCurrentAccount } from '@hcengineering/core'
  import { IntlString } from '@hcengineering/platform'
  import { Card, isAdminUser } from '@hcengineering/presentation'
  import ui, { Button, Label } from '@hcengineering/ui'
  import { ObjectPresenter } from '@hcengineering/view-resources'
  import view from '@hcengineering/view-resources/src/plugin'
  import { createEventDispatcher } from 'svelte'
  import { personAccountByIdStore } from '../utils'
  import PersonAccountPresenter from './PersonAccountPresenter.svelte'
  import PersonAccountRefPresenter from './PersonAccountRefPresenter.svelte'

  export let object: Doc | Doc[]
  export let deleteAction: () => void | Promise<void>
  export let skipCheck: boolean = false
  export let canDeleteExtra: boolean = true
  export let confirmation: IntlString | undefined = undefined

  const objectArray = Array.isArray(object) ? object : [object]
  const owners: PersonAccount[] = Array.from($personAccountByIdStore.values()).filter(
    (acc) => acc.role === AccountRole.Owner
  )
  const dispatch = createEventDispatcher()
  $: creators = [...new Set(objectArray.map((obj) => obj.createdBy as Ref<PersonAccount>))]
  $: canDelete =
    (skipCheck ||
      (creators.length === 1 && creators.includes(getCurrentAccount()._id as Ref<PersonAccount>)) ||
      getCurrentAccount().role === AccountRole.Owner ||
      isAdminUser()) &&
    canDeleteExtra
  $: label = canDelete ? view.string.DeleteObject : view.string.DeletePopupNoPermissionTitle
</script>

<Card
  {label}
  okAction={deleteAction}
  canSave={canDelete}
  okLabel={canDelete ? view.string.LabelYes : ui.string.Ok}
  on:close={() => dispatch('close')}
>
  <svelte:fragment slot="buttons">
    {#if canDelete}
      <Button label={view.string.LabelNo} on:click={() => dispatch('close')} />
    {/if}
  </svelte:fragment>
  <div class="flex-grow flex-col">
    {#if canDelete}
      <div class="mb-2">
        <Label label={confirmation ?? view.string.DeleteObjectConfirm} params={{ count: objectArray.length }} />
        <div class="mt-2">
          {#if objectArray.length === 1}
            <ObjectPresenter _class={objectArray[0]._class} objectId={objectArray[0]._id} value={objectArray[0]} />
          {/if}
        </div>
      </div>
    {:else}
      <div class="mb-2">
        <Label label={view.string.DeletePopupNoPermissionLabel} />
      </div>
      <div class="mb-2">
        <Label label={view.string.DeletePopupCreatorLabel} />
        {#each creators as account}
          <div class="my-2">
            <PersonAccountRefPresenter value={account} />
          </div>
        {/each}
      </div>
      <div class="mb-2">
        <Label label={view.string.DeletePopupOwnerLabel} />
        {#each owners as owner}
          <div class="my-2">
            <PersonAccountPresenter value={owner} />
          </div>
        {/each}
      </div>
    {/if}
  </div>
  <slot />
</Card>
