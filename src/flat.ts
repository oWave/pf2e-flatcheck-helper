export async function rollFlatCheck(dc: number) {
  const r = await new Roll("d20").roll()
  const degree = r.total >= dc ? 2 : 1

  // @ts-expect-error pf2e
  const flavor = await game.pf2e.Check.createResultFlavor({
    degree: {
      value: degree,
      unadjusted: degree,
      adjustment: null,
      dieResult: r.total,
      rollTotal: r.total,
      dc: { label: "Flat Check DC", value: dc },
    },
  })

  r.toMessage({ flavor: flavor.outerHTML })

  // r.toMessage({}, { create: true })
}

const DCS = {
  concealed: 5,
  hidden: 11,
  invisible: 11,
}

function dcForToken(token: Token) {
  let dc = 0
  // @ts-expect-error pf2e
  token.actor?.conditions.forEach((c) => {
    dc = Math.max(DCS[c.slug] ?? 0, dc)
  })
  return dc || null
}

export async function rollForSingleTarget(target: Token | undefined) {
  if (!target) return
  const dc = dcForToken(target)
  if (!dc)
    ui.notifications.warn(
      "Selected target has no conditions that require a flat check"
    )
  else rollFlatCheck(dc)
}
