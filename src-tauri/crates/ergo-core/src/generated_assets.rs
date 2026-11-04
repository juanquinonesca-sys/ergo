use std::collections::HashSet;

use crate::ast::{AssetEntry, DocumentAST, DocumentElement, DocumentSection};
use crate::typst_source::paths::path_id_for_id;

pub fn is_generated_diagram_asset_path(path: &str) -> bool {
    path.starts_with("assets/diagrams/")
        && path.ends_with(".svg")
        && !path.contains("..")
        && path
            .strip_prefix("assets/diagrams/")
            .map(|file_name| !file_name.is_empty() && !file_name.contains('/'))
            .unwrap_or(false)
}

pub fn generated_diagram_asset_path_for_element(
    ast: &DocumentAST,
    element_id: &str,
) -> Option<String> {
    let diagram = find_diagram(ast, element_id)?;
    let asset_id = diagram.asset_id.as_deref()?;
    let asset = ast.assets.iter().find(|entry| entry.id == asset_id)?;
    if is_generated_diagram_asset_path(&asset.path) {
        Some(asset.path.clone())
    } else {
        None
    }
}

/// SVG a diagram renders from: its asset entry's path, else the generated path.
pub fn diagram_svg_path(assets: &[AssetEntry], asset_id: &str) -> String {
    assets
        .iter()
        .find(|asset| asset.id == asset_id)
        .map(|asset| asset.path.clone())
        .unwrap_or_else(|| format!("assets/diagrams/{}.svg", path_id_for_id(asset_id)))
}

/// Generated SVGs some diagram of the document still renders from. The VFS keeps
/// a removed diagram's SVG (undo, cut/paste and moves restore the element), so
/// saving packs only these.
pub fn referenced_generated_diagram_paths(ast: &DocumentAST) -> HashSet<String> {
    ast.sections
        .iter()
        .flat_map(|section| match section {
            DocumentSection::Content(content) => content.elements.iter(),
        })
        .filter_map(|element| match element {
            DocumentElement::Diagram(diagram) => diagram.asset_id.as_deref(),
            _ => None,
        })
        .filter(|asset_id| !asset_id.trim().is_empty())
        .map(|asset_id| diagram_svg_path(&ast.assets, asset_id))
        .filter(|path| is_generated_diagram_asset_path(path))
        .collect()
}

fn find_diagram<'a>(
    ast: &'a DocumentAST,
    element_id: &str,
) -> Option<&'a crate::ast::Diagram> {
    for section in &ast.sections {
        let DocumentSection::Content(content) = section;
        for element in &content.elements {
            if let DocumentElement::Diagram(diagram) = element {
                if diagram.id == element_id {
                    return Some(diagram);
                }
            }
        }
    }
    None
}
