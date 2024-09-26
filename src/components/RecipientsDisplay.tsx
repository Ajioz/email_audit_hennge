import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import RecipientsBadge from './RecipientsBadge'


// Wrapper for the whole Recipients Display, based on design specification, flex ensures the badge is aligned right
const RecipientsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between; // Ensure the badge is on the far right as required
  white-space: nowrap;
  overflow: hidden;
`

// Container for the recipient list, using the built in ellipsis approach in css rle
const RecipientsListWrapper = styled.div`
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

// Tooltip Components style, using the design specification in the challenge detail
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


// Props interface for ToolTipDisplay
type ToolTipInterface = {
  recipients: string[]
  isVisible: boolean
}

// Tooltip component to display all recipients
export const RecipientTooltip: React.FC<ToolTipInterface> = ({
  recipients,
  isVisible,
}) => {
  if (!isVisible) return null

  return <TooltipWrapper>{recipients.join(', ')}</TooltipWrapper>
}


// Props interface for RecipientsDisplay
type RecipientsDisplayProps = {
  recipients: string[]
}


// Main Recipients Display component
const RecipientsDisplay: React.FC<RecipientsDisplayProps> = ({recipients}) => {
  const [numTruncated, setNumTruncated] = useState(0) // State to track number of truncated recipients
  const [toolTip, setToolTip] = useState(false) // State for tooltip visibility
  const [visibleRecipients, setVisibleRecipients] = useState<string[]>([]) // State for visible recipients
  const wrapperRef = useRef<HTMLDivElement>(null) // Ref for the wrapper element

  useEffect(() => {

    if (!wrapperRef.current) return // Exit if ref is not not properly assigned to a DOM element

    const available_width = wrapperRef.current.clientWidth // Get available width
    let usedWidth = 0 // create occupied width and initialize to 0
    let newVisibleRecipients: string[] = [] // create an Array for visible recipients

    // Measure the width of ', ...'
    const ellipsis_length = checkText_width(', ...', wrapperRef.current)

    // Calculate the width of the badge
    const badgeText = `+${recipients.length - newVisibleRecipients.length}`
    const badgeWidth = checkText_width(badgeText, wrapperRef.current)

    // Iterate through the recipients and decide what to show
    for (let i = 0; i < recipients.length; i++) {
      const email = recipients[i] // Current recipient email
      const emailWidth = checkText_width(email, wrapperRef.current) // Measure the current email width

      // Calculate the remaining space needed for ellipsis and badge
      const spaceLeft = available_width - usedWidth

      if (
        i === recipients.length - 1 ||
        spaceLeft < emailWidth + ellipsis_length + badgeWidth
      ) {
        // If there is no space for the last recipient or current email with ellipsis and badge
        break
      }

      // Add email to visible recipients and update the used width
      newVisibleRecipients.push(email)
      usedWidth += emailWidth
    }

    // Check if there is enough space for the ellipsis and badge, if not, trim more
    const totalWidthWithEllipsisAndBadge =
      usedWidth + ellipsis_length + badgeWidth

    if (
      totalWidthWithEllipsisAndBadge > available_width &&
      newVisibleRecipients.length > 0
    ) {
      // Remove the last visible email if it doesn't fully fit
      newVisibleRecipients.pop()
    }

    // Calculate how many recipients are hidden
    const hiddenCount = recipients.length - newVisibleRecipients.length

    setVisibleRecipients(newVisibleRecipients) // Update state with visible recipients
    setNumTruncated(hiddenCount) // Set number of truncated recipients
  }, [recipients]) // Dependency on recipients array

  // Function to measure the width of text
  const checkText_width = (text: string, element: HTMLDivElement) => {
    const canvas = document.createElement('canvas') // Create a canvas element
    const context = canvas.getContext('2d') // Get 2D context
    const style = window.getComputedStyle(element) // Get computed styles of the element
    if (context && style) {
      context.font = `${style.fontSize} ${style.fontFamily}` // Set font for measurement
      return context.measureText(text).width // Measure and return text width
    }
    return 0 // Return 0 if context is not available
  }

  return (
    <RecipientsWrapper ref={wrapperRef}>
      {/* This section handles the recipients display and truncation */}
      <RecipientsListWrapper>
        {recipients.length === 1 ? (
          // Special case for a single recipient, truncate it with ellipsis if necessary
          <span>{recipients[0]}</span>
        ) : (
          <>
            {visibleRecipients.join(', ')}
            {numTruncated > 0 && ', ...'}
          </>
        )}
      </RecipientsListWrapper>

      {/* The RecipientsBadge only shows if there's more than one recipient and truncation occurs */}
      {recipients.length > 1 && numTruncated > 0 && (
        <>
          <RecipientsBadge
            numTruncated={numTruncated} // Pass number of truncated recipients
            onMouseEnter={() => setToolTip(true)} // Show tooltip on mouse enter
            onMouseLeave={() => setToolTip(false)} // Hide tooltip on mouse leave
          />
          {/* Tooltip to show all recipients */}
          <RecipientTooltip
            recipients={recipients} // Pass all recipients to tooltip
            isVisible={toolTip} // Pass tooltip visibility state
          />
        </>
      )}
    </RecipientsWrapper>
  )
}

export default RecipientsDisplay


