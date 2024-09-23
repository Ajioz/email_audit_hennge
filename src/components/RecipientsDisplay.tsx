import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import RecipientsBadge from './RecipientsBadge' // Assuming the badge is coming from here

// Props for RecipientsDisplay
type RecipientsDisplayProps = {
  recipients: string[]
}

// Wrapper for Recipients Display
const RecipientsWrapper = styled.div`
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

// Tooltip Components
const TooltipWrapper = styled.div`
  position: fixed;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  background-color: #666;
  color: #f0f0f0;
  padding: 8px 16px;
  border-radius: 24px;
  z-index: 1;
`

// Tooltip component to display all recipients
export const RecipientTooltip: React.FC<{
  recipients: string[]
  isVisible: boolean
}> = ({ recipients, isVisible }) => {
  if (!isVisible) return null

  return <TooltipWrapper>{recipients.join(', ')}</TooltipWrapper>
}

// Main Recipients Display component
const RecipientsDisplay: React.FC<RecipientsDisplayProps> = ({
  recipients,
}) => {
  const [numTruncated, setNumTruncated] = useState(0)
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!wrapperRef.current) return

    const availableWidth = wrapperRef.current.clientWidth
    let usedWidth = 0
    let visibleRecipients: string[] = []

    for (let i = 0; i < recipients.length; i++) {
      const email = recipients[i]
      const emailWidth = measureTextWidth(email, wrapperRef.current)

      // Only add full email addresses that fit
      if (usedWidth + emailWidth <= availableWidth) {
        visibleRecipients.push(email)
        usedWidth += emailWidth
      } else {
        break
      }
    }

    const hiddenCount = recipients.length - visibleRecipients.length

    // If only one recipient and it doesn't fully fit, allow it to be clipped
    if (recipients.length === 1 && usedWidth > availableWidth) {
      visibleRecipients = [recipients[0]]
      setNumTruncated(0)
    } else {
      setNumTruncated(hiddenCount)
    }
  }, [recipients])

  // Function to measure the width of text
  const measureTextWidth = (text: string, element: HTMLDivElement) => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    const style = window.getComputedStyle(element)
    if (context && style) {
      context.font = `${style.fontSize} ${style.fontFamily}`
      return context.measureText(text).width
    }
    return 0
  }

  return (
    <RecipientsWrapper ref={wrapperRef}>
      {recipients.slice(0, recipients.length - numTruncated).join(', ')}
      {numTruncated > 0 && (
        <>
          , ...
          <RecipientsBadge
            numTruncated={numTruncated}
            onMouseEnter={() => setIsTooltipVisible(true)}
            onMouseLeave={() => setIsTooltipVisible(false)}
          />
          {/* Tooltip to show all recipients */}
          <RecipientTooltip
            recipients={recipients}
            isVisible={isTooltipVisible}
          />
        </>
      )}
    </RecipientsWrapper>
  )
}

export default RecipientsDisplay

/**
 * 

# Challenge Details

Development of an `Email Audit` system is currently in progress. Assume that this project is a real project and is being used in a production environment on a trial basis, since the features are not yet complete.

As the first assignment, two UI elements need to be implemented:

- The first one is called `RecipientsDisplay`, it is a table cell that is used to intelligently show email recipients inside the `AuditTable` component. This cell will trim recipients that are too long to display in the table.
- The second element is called `RecipientTooltip`, a tooltip-like component that will be used to display all of the email recipients, even ones that are trimmed in the table cell.

The task is to implement these UI elements in the `RecipientsDisplay` file within any of the included frameworks. Modifying or adding new props, re-ordering the recipients, and adding new or extra functionalities and features are not allowed in this assignment. Additionally, the component needs to be written in **Typescript**.

## `RecipientsDisplay`

Assume that an employee can send an email to many recipients. Due to the limited amount of space, the information has to be displayed well. The design team has come up with the following design specifications:

- If all the email addresses in the recipients list fit in the available space, display them as they are, delimited by a comma and space (e.g. `John.Smith@gmail.com, Jane.Smith@outlook.com`).
- If there is not enough space to display the entire recipients list, it must be trimmed. To prevent showing clipped email addresses that are hard to read, show only the portion of the recipients list that does fit. In other words, if the entirety of an email address does not fit, it must not be shown.
- If the recipients list has been trimmed (i.e. at least one email address is not shown), add `, ...` after the last email address shown. Furthermore, the rightmost end of the column must indicate the number of trimmed recipients with the provided `RecipientsBadge` component.
- A special case is given to the first recipient. If there is not enough space to fit even the first recipient's email address, the email address is allowed to be clipped with an ellipsis. If there is only one recipient, a badge must not be shown. If there is more than one recipient, the first recipient must be excluded from the number of trimmed recipients in the badge.
- This functionality should work on any screen size and when the screen is resized. For simplicity, this will only be tested in a recent version of a `Chromium` browser.
- For the element that holds the list of recipients, the `display` must be set to `flex` and the `align-items` property must be set to `center` to ensure alignment correctness.
- Do not modify or add new props to the `RecipientsBadge` component.
- Do not re-order the recipients.
- Do not add new/extra functionalities and features.

## `RecipientsTooltip`

Assume a use-case exists where the entirety of a recipient list must be made visible. The solution provided by the design team is to show the full list of the recipients at the **top right** corner of the viewport.

- The recipients list must be shown in a tooltip at the **top right** corner of the viewport.
- The tooltip must only be shown when the user hovers over a `RecipientsBadge` component.
- The tooltip must not be shown if the user is not hovering over a badge.
- The tooltip must display **`all of the email addresses in the recipients list, delimited by a comma and space`** (e.g. `John.Smith@gmail.com, Jane.Smith@outlook.com`).
- Assume that the viewport is wide enough to show the tooltip without any truncation.
- Do not create a new file, the tooltip must be located inside the `RecipientsDisplay` file.
- Do not re-order the recipients, display them as they are.
- Do not add new/extra functionalities and features.
- The tooltip should have the following styles:
  - Margin from the top right corner of the viewport is `8px`.
  - Padding top and bottom are `8px`.
  - Padding left and right are `16px`.
  - Background color is `#666`.
  - Text color is `#f0f0f0`.
  - Border radius is `24px`.
  - The `display` property must be set to `flex` and the `align-items` property must be set to `center` to ensure alignment correctness.




 */
